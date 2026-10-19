import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { db, schema } from './db/index.js';
import { BridgeEngine } from '@switchbridge/core';

import { getSystemConfig, saveSystemConfig, hashPassword, verifyPassword } from './config.js';
import { createToken, verifyToken } from './auth.js';
import { fetchOidcDiscovery, exchangeOidcCode, evaluateUserRole, resolveInternalUrl } from './oidc.js';
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
      oidc: config.auth.oidc ? {
        issuerUrl: config.auth.oidc.issuerUrl,
        clientId: config.auth.oidc.clientId,
        roleMapping: config.auth.oidc.roleMapping || null,
      } : null,
    };
  });

  // Setup Helper: Test OIDC Discovery and Auto-Discover Roles
  server.post('/api/setup/oidc/test', async (req, reply) => {
    const body = req.body as { issuerUrl?: string; clientId?: string; clientSecret?: string };
    if (!body || !body.issuerUrl) {
      return reply.status(400).send({ error: 'Field "issuerUrl" is required' });
    }

    try {
      const discovery = await fetchOidcDiscovery(body.issuerUrl);
      const discoveredRolesSet = new Set<string>();

      // Automatically discover roles from OIDC provider via client credentials
      if (body.clientId && body.clientSecret) {
        try {
          const tokenUrl = resolveInternalUrl(discovery.token_endpoint);
          const params = new URLSearchParams();
          params.append('grant_type', 'client_credentials');
          params.append('client_id', body.clientId);
          params.append('client_secret', body.clientSecret);

          const tokenRes = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
            signal: AbortSignal.timeout(4000),
          });

          if (tokenRes.ok) {
            const data = (await tokenRes.json()) as any;
            if (data.access_token) {
              const parts = data.access_token.split('.');
              if (parts.length >= 2) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
                if (payload.realm_access?.roles) payload.realm_access.roles.forEach((r: any) => discoveredRolesSet.add(r));
                if (payload.resource_access?.[body.clientId]?.roles) payload.resource_access[body.clientId].roles.forEach((r: any) => discoveredRolesSet.add(r));
                if (payload.roles) payload.roles.forEach((r: any) => discoveredRolesSet.add(r));
                if (payload.groups) payload.groups.forEach((g: any) => discoveredRolesSet.add(g));
              }
            }
          }
        } catch {}
      }

      // Filter out internal technical/scope roles
      const filteredRoles = Array.from(discoveredRolesSet).filter(
        (r) => !r.startsWith('default-roles-') && r !== 'uma_authorization' && r !== 'offline_access'
      );

      const finalRoles = filteredRoles.length > 0 ? filteredRoles : ['admin', 'operator', 'viewer'];

      return {
        success: true,
        issuer: discovery.issuer,
        authorizationEndpoint: discovery.authorization_endpoint,
        tokenEndpoint: discovery.token_endpoint,
        userinfoEndpoint: discovery.userinfo_endpoint,
        jwksUri: discovery.jwks_uri,
        discoveredRoles: finalRoles,
      };
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Failed to reach or parse OIDC discovery configuration',
      });
    }
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
        roleMapping?: {
          enabled: boolean;
          claimPath?: string;
          rules?: Array<{
            id: string;
            oidcRole: string;
            switchbridgeRole: 'admin' | 'operator' | 'viewer';
            permissions?: string[];
          }>;
          defaultRole?: 'viewer' | 'deny';
          adminRoles?: string[];
          operatorRoles?: string[];
          claimsPath?: string;
        };
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

  // Authentication: Generate OIDC Authorization URL
  server.get('/api/auth/oidc/url', async (req, reply) => {
    const config = getSystemConfig();
    if (config.auth.mode !== 'oidc' || !config.auth.oidc) {
      return reply.status(400).send({ error: 'OIDC is not enabled or configured' });
    }

    const { issuerUrl, clientId } = config.auth.oidc;
    const redirectUri = (req.query as any)?.redirectUri;
    if (!redirectUri) {
      return reply.status(400).send({ error: 'redirectUri is required in query params' });
    }

    try {
      const discovery = await fetchOidcDiscovery(issuerUrl);
      const state = randomUUID();
      let authEndpoint = discovery.authorization_endpoint;
      try {
        const userOrigin = new URL(issuerUrl).origin;
        const discOrigin = new URL(authEndpoint).origin;
        if (userOrigin !== discOrigin) {
          authEndpoint = authEndpoint.replace(discOrigin, userOrigin);
        }
      } catch {}

      const authUrl = new URL(authEndpoint);
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('state', state);

      return {
        success: true,
        url: authUrl.toString(),
        state,
      };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to build OIDC authorization URL' });
    }
  });

  // Authentication: Exchange OIDC code for Switchbridge Session
  server.post('/api/auth/oidc/exchange', async (req, reply) => {
    const config = getSystemConfig();
    if (config.auth.mode !== 'oidc' || !config.auth.oidc) {
      return reply.status(400).send({ error: 'OIDC is not enabled or configured' });
    }

    const body = req.body as { code?: string; redirectUri?: string };
    if (!body || !body.code || !body.redirectUri) {
      return reply.status(400).send({ error: 'Fields "code" and "redirectUri" are required' });
    }

    try {
      const userInfo = await exchangeOidcCode({
        issuerUrl: config.auth.oidc.issuerUrl,
        clientId: config.auth.oidc.clientId,
        clientSecret: config.auth.oidc.clientSecret,
        code: body.code,
        redirectUri: body.redirectUri,
        claimPath: config.auth.oidc.roleMapping?.claimPath,
      });

      // Find or create user in SQLite database
      const existing = db.select().from(schema.users).where(eq(schema.users.username, userInfo.username)).all();
      let user = existing[0];

      // Auto-collect any newly discovered roles from user's token for administrator
      if (userInfo.roles && userInfo.roles.length > 0 && config.auth.oidc) {
        const existingSet = new Set(config.auth.oidc.discoveredRoles || []);
        let hasNew = false;
        for (const r of userInfo.roles) {
          if (!existingSet.has(r)) {
            existingSet.add(r);
            hasNew = true;
          }
        }
        if (hasNew) {
          saveSystemConfig({
            auth: {
              ...config.auth,
              oidc: {
                ...config.auth.oidc,
                discoveredRoles: Array.from(existingSet),
              },
            },
          });
        }
      }

      // Determine user role strictly based on administrator-configured mapping rules
      const roleMappingConfig = config.auth.oidc.roleMapping;
      const role = evaluateUserRole(userInfo.roles, roleMappingConfig);

      if (role === 'deny') {
        return reply.status(403).send({
          error: 'ACCESS_DENIED_NO_ROLE',
          message: 'ACCESS DENIED: No authorized role assigned in Identity Provider for your account.',
        });
      }

      if (!user) {
        user = {
          id: randomUUID(),
          username: userInfo.username,
          email: userInfo.email,
          passwordHash: null,
          role,
          createdAt: new Date(),
        };
        db.insert(schema.users).values(user).run();
      } else {
        // Synchronize user role and email on every login
        if (user.role !== role || user.email !== userInfo.email) {
          db.update(schema.users)
            .set({ role, email: userInfo.email })
            .where(eq(schema.users.id, user.id))
            .run();
          user.role = role;
          user.email = userInfo.email;
        }
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
    } catch (err: any) {
      return reply.status(400).send({
        error: err.message || 'Failed to exchange authorization code with OIDC provider',
      });
    }
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

  // Get current OIDC Role Mapping settings & discovered roles
  server.get('/api/settings/role-mapping', async () => {
    const config = getSystemConfig();
    return {
      success: true,
      authMode: config.auth.mode,
      oidcConfigured: Boolean(config.auth.oidc),
      discoveredRoles: config.auth.oidc?.discoveredRoles || ['admin', 'operator', 'viewer'],
      roleMapping: config.auth.oidc?.roleMapping || {
        enabled: false,
        rules: [],
        defaultRole: 'deny',
      },
    };
  });

  // Save/Update OIDC Role Mapping settings (administrator authority)
  server.post('/api/settings/role-mapping', async (req, reply) => {
    const config = getSystemConfig();
    if (config.auth.mode !== 'oidc' || !config.auth.oidc) {
      return reply.status(400).send({
        error: 'OIDC_NOT_CONFIGURED',
        message: 'OIDC authentication is not active in this instance',
      });
    }

    const body = req.body as {
      enabled: boolean;
      claimPath?: string;
      rules?: any[];
      defaultRole?: 'viewer' | 'deny';
    };

    if (!body) {
      return reply.status(400).send({ error: 'MISSING_REQUEST_BODY' });
    }

    const updatedRoleMapping = {
      enabled: Boolean(body.enabled),
      claimPath: body.claimPath?.trim() || 'realm_access.roles',
      rules: Array.isArray(body.rules) ? body.rules : [],
      defaultRole: body.defaultRole || 'deny',
    };

    saveSystemConfig({
      auth: {
        ...config.auth,
        oidc: {
          ...config.auth.oidc,
          roleMapping: updatedRoleMapping,
        },
      },
    });

    return {
      success: true,
      roleMapping: updatedRoleMapping,
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
