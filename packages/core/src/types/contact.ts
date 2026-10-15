import { PlatformType } from './message.js';

export interface PlatformIdentity {
  platform: PlatformType;
  platformUserId: string;
  username?: string;
  displayName?: string;
  linkedAt: Date;
}

export interface UnifiedContact {
  id: string;                      // Internal Switchbridge Contact ID
  email?: string;
  phone?: string;
  identities: PlatformIdentity[];  // All connected messenger identities
  tags: string[];                  // e.g. ['vip', 'beta-tester', 'support']
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
