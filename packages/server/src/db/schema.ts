import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(), // internal uuid
  platform: text('platform').notNull(), // 'telegram' | 'discord' | 'slack'
  channelId: text('channel_id').notNull(),
  name: text('name').notNull(),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bridges = sqliteTable('bridges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  endpointsJson: text('endpoints_json').notNull(), // JSON array of endpoints
  optionsJson: text('options_json'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  email: text('email'),
  phone: text('phone'),
  tagsJson: text('tags_json').default('[]'),
  identitiesJson: text('identities_json').default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const messageLogs = sqliteTable('message_logs', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  channelId: text('channel_id').notNull(),
  authorName: text('author_name').notNull(),
  text: text('text').notNull(),
  forwardedTo: text('forwarded_to'), // JSON array of targets
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('viewer'), // 'admin' | 'operator' | 'viewer'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  role: text('role').notNull().default('viewer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});
