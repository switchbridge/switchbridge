import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { db, schema } from './db/index.js';
import { BridgeEngine } from '@switchbridge/core';

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

  // Health check
  server.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'switchbridge-server',
      version: '0.1.0',
      uptime: process.uptime(),
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
