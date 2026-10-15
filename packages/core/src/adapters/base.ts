import { EventEmitter } from 'node:events';
import { OutboundMessage, PlatformType, UnifiedMessage } from '../types/message.js';

export interface AdapterEvents {
  message: [message: UnifiedMessage];
  error: [error: Error];
  ready: [];
}

export abstract class BaseAdapter extends EventEmitter {
  public abstract readonly platform: PlatformType;
  public abstract readonly name: string;

  /**
   * Initialize connection, register webhooks, or start long-polling
   */
  public abstract start(): Promise<void>;

  /**
   * Graceful shutdown of connection
   */
  public abstract stop(): Promise<void>;

  /**
   * Send a normalized message to this platform
   */
  public abstract send(message: OutboundMessage): Promise<{ externalMessageId: string }>;

  /**
   * Helper to normalize raw SDK incoming payload to UnifiedMessage
   */
  protected abstract normalizeIncoming(raw: any): UnifiedMessage;
}
