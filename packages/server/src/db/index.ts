import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = process.env.DATA_DIR || path.resolve(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'switchbridge.sqlite'));
// Enable WAL mode for high concurrent throughput
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
