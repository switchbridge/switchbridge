import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface RoleMappingRule {
  id: string;
  oidcRole: string;
  switchbridgeRole: 'admin' | 'operator' | 'viewer';
  permissions?: string[];
}

export interface OidcRoleMappingConfig {
  enabled: boolean;
  claimPath?: string;
  rules?: RoleMappingRule[];
  defaultRole?: 'viewer' | 'deny';
  // Legacy backward-compatibility fields:
  adminRoles?: string[];
  operatorRoles?: string[];
  claimsPath?: string;
}

export interface SwitchbridgeConfig {
  version: string;
  initialized: boolean;
  auth: {
    mode: 'none' | 'builtin' | 'oidc';
    oidc?: {
      issuerUrl: string;
      clientId: string;
      clientSecret?: string;
      roleMapping?: OidcRoleMappingConfig;
    };
  };
  database: {
    engine: 'sqlite' | 'postgres';
    url?: string;
  };
  queue: {
    engine: 'memory' | 'redis';
    redisUrl?: string;
  };
}

const DEFAULT_CONFIG: SwitchbridgeConfig = {
  version: '1.0.0',
  initialized: false,
  auth: {
    mode: 'builtin',
  },
  database: {
    engine: 'sqlite',
  },
  queue: {
    engine: 'memory',
  },
};

export function getDataDir(): string {
  const dir = process.env.DATA_DIR || path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getConfigFilePath(): string {
  return path.join(getDataDir(), 'switchbridge.config.json');
}

export function getSystemConfig(): SwitchbridgeConfig {
  const filePath = getConfigFilePath();

  // 1. Check if config file exists
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch (e) {
      console.error('Failed to parse switchbridge.config.json, falling back to default', e);
    }
  }

  // 2. Check if headless environment variables are set
  if (process.env.SKIP_SETUP === 'true' || process.env.ADMIN_PASSWORD) {
    return {
      version: '1.0.0',
      initialized: true,
      auth: {
        mode: (process.env.AUTH_MODE as any) || 'builtin',
      },
      database: {
        engine: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite',
        url: process.env.DATABASE_URL,
      },
      queue: {
        engine: process.env.REDIS_URL ? 'redis' : 'memory',
        redisUrl: process.env.REDIS_URL,
      },
    };
  }

  return DEFAULT_CONFIG;
}

export function saveSystemConfig(patch: Partial<SwitchbridgeConfig>): SwitchbridgeConfig {
  const current = getSystemConfig();
  const updated: SwitchbridgeConfig = {
    ...current,
    ...patch,
    auth: { ...current.auth, ...(patch.auth || {}) },
    database: { ...current.database, ...(patch.database || {}) },
    queue: { ...current.queue, ...(patch.queue || {}) },
  };

  const filePath = getConfigFilePath();
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

// Password hashing using node:crypto scrypt (zero external dependencies)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}
