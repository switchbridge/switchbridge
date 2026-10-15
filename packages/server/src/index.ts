import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { db, schema } from './db/index.js';
import { BridgeEngine } from '@switchbridge/core';

import { getSystemConfig, saveSystemConfig, hashPassword, verifyPassword } from './config.js';
import { createToken, verifyToken } from './auth.js';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

export async function createServer() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: '*',
  });

  await server.register(websocket);

  // In-memory BridgeEngine instance
  const bridgeEngine = new BridgeEngine([]);

  // Connected WebSocket clients (for real-time message stream)
  const clients = new Set<any>();

  // WebSocket route for live message feed
  server.get('/ws/feed', { websocket: true }, (socket, req) => {
    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
    socket.send(JSON.stringify({ type: 'connected', time: new Date() }));
  });

  // Setup Wizard status
  server.get('/api/setup/status', async () => {
    const config = getSystemConfig();
    const adminUsers = db.select().from(schema.users).where(eq(schema.users.role, 'admin')).all();
    return {
      initialized: config.initialized,
      authMode: config.auth.mode,
      hasAdmin: adminUsers.length > 0,
      adminUsername: adminUsers[0]?.username,
    };
  });

  // Setup Step 1: Configure RBAC
  server.post('/api/setup/rbac', async (req, reply) => {
    const body = req.body as {
      mode: 'none' | 'builtin' | 'oidc';
      admin?: {
        username?: string;
        password?: string;
        email?: string;
      };
      oidc?: {
        issuerUrl: string;
        clientId: string;
        clientSecret?: string;
      };
    };

    if (!body || !body.mode) {
      return reply.status(400).send({ error: 'Field "mode" is required (none | builtin | oidc)' });
    }

    if (body.mode === 'builtin') {
      const username = body.admin?.username?.trim() || 'admin';
      const password = body.admin?.password;
      const email = body.admin?.email?.trim() || 'admin@switchbridge.local';

      if (!password || password.length < 6) {
        return reply.status(400).send({ error: 'Password must be at least 6 characters long' });
      }

      // Check if admin already exists
      const existing = db.select().from(schema.users).where(eq(schema.users.username, username)).all();
      const passwordHash = hashPassword(password);

      if (existing.length > 0) {
        db.update(schema.users)
          .set({ passwordHash, role: 'admin' })
          .where(eq(schema.users.username, username))
          .run();
      } else {
        db.insert(schema.users)
          .values({
            id: randomUUID(),
            username,
            email,
            passwordHash,
            role: 'admin',
            createdAt: new Date(),
          })
          .run();
      }
    }

    // Save choice to system config
    const updated = saveSystemConfig({
      initialized: true, // RBAC configured, system now ready
      auth: {
        mode: body.mode,
        oidc: body.oidc,
      },
    });

    return {
      success: true,
      mode: body.mode,
      config: updated,
    };
  });

  // Reset setup for testing
  server.post('/api/setup/reset', async () => {
    saveSystemConfig({ initialized: false });
    return { success: true, message: 'System setup reset to uninitialized' };
  });

  // Authentication: Login
  server.post('/api/auth/login', async (req, reply) => {
    const body = req.body as { username?: string; password?: string };
    if (!body || !body.username || !body.password) {
      return reply.status(400).send({ error: 'USERNAME_AND_PASSWORD_REQUIRED' });
    }

    const username = body.username.trim();
    const users = db.select().from(schema.users).where(eq(schema.users.username, username)).all();
    const user = users[0];

    if (!user || !user.passwordHash || !verifyPassword(body.password, user.passwordHash)) {
      return reply.status(401).send({ error: 'INVALID_CREDENTIALS' });
    }

    const token = createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  });

  // Authentication: Current User Status
  server.get('/api/auth/me', async (req, reply) => {
    const config = getSystemConfig();
    
    // If auth mode is 'none', grant immediate admin rights without login
    if (config.auth.mode === 'none') {
      return {
        authenticated: true,
        authMode: 'none',
        user: {
          id: 'open-lan-admin',
          username: 'lan-user',
          email: null,
          role: 'admin',
        },
      };
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        authenticated: false,
        authMode: config.auth.mode,
        error: 'NO_TOKEN',
      });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    if (!payload) {
      return reply.status(401).send({
        authenticated: false,
        authMode: config.auth.mode,
        error: 'INVALID_OR_EXPIRED_TOKEN',
      });
    }

    const users = db.select().from(schema.users).where(eq(schema.users.id, payload.userId)).all();
    const user = users[0];
    if (!user) {
      return reply.status(401).send({
        authenticated: false,
        authMode: config.auth.mode,
        error: 'USER_NOT_FOUND',
      });
    }

    return {
      authenticated: true,
      authMode: config.auth.mode,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  });

  // Authentication: Logout
  server.post('/api/auth/logout', async () => {
    return { success: true };
  });

  // Health check
  server.get('/api/health', async () => {
    const config = getSystemConfig();
    return {
      status: 'ok',
      service: 'switchbridge-server',
      version: '0.1.0',
      uptime: process.uptime(),
      initialized: config.initialized,
      authMode: config.auth.mode,
    };
  });

  // Get active bridges
  server.get('/api/bridges', async () => {
    const list = db.select().from(schema.bridges).all();
    return list;
  });

  // Get connected channels
  server.get('/api/channels', async () => {
    const list = db.select().from(schema.channels).all();
    return list;
  });

  // Get contacts
  server.get('/api/contacts', async () => {
    const list = db.select().from(schema.contacts).all();
    return list;
  });

  // Get system statistics
  server.get('/api/stats', async () => {
    const bridgesCount = db.select().from(schema.bridges).all().length;
    const channelsCount = db.select().from(schema.channels).all().length;
    const contactsCount = db.select().from(schema.contacts).all().length;
    return {
      bridgesCount,
      channelsCount,
      contactsCount,
    };
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3000;
  const server = await createServer();
  server.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`⚡ Switchbridge server listening on ${address}`);
  });
}
