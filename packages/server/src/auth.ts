import crypto from 'node:crypto';

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  exp: number; // Unix timestamp in ms
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'switchbridge-default-super-secret-jwt-key-2026';

export function createToken(user: AuthUser, expiresInDays = 7): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}
