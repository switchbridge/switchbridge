import { UnifiedMessage, OutboundMessage, PlatformType } from '../types/message.js';
import { BaseAdapter } from '../adapters/base.js';

export interface ChannelEndpoint {
  platform: PlatformType;
  channelId: string;
}

export interface BridgeLink {
  id: string;
  name?: string;
  endpoints: ChannelEndpoint[];
  options?: {
    prefixAuthorName?: boolean;  // Prefix "[Telegram/User]: message text"
    direction?: 'bi-directional' | 'one-way';
  };
}

export class BridgeEngine {
  private links: Map<string, BridgeLink> = new Map();
  private adapters: Map<PlatformType, BaseAdapter> = new Map();

  constructor(adapters: BaseAdapter[]) {
    for (const adapter of adapters) {
      this.registerAdapter(adapter);
    }
  }

  public registerAdapter(adapter: BaseAdapter): void {
    this.adapters.set(adapter.platform, adapter);
    adapter.on('message', (msg: UnifiedMessage) => this.handleIncomingMessage(msg));
  }

  public addBridgeLink(link: BridgeLink): void {
    this.links.set(link.id, link);
  }

  public removeBridgeLink(linkId: string): boolean {
    return this.links.delete(linkId);
  }

  private async handleIncomingMessage(message: UnifiedMessage): Promise<void> {
    // Avoid loop if the message was sent by Switchbridge bot itself
    if (message.author.isBot || message.metadata?.isBridgeEcho) {
      return;
    }

    // Find all bridges where this channel is an endpoint
    for (const link of this.links.values()) {
      const isOrigin = link.endpoints.some(
        (ep) => ep.platform === message.platform && ep.channelId === message.channelId
      );

      if (!isOrigin) continue;

      // Broadcast to other endpoints
      for (const target of link.endpoints) {
        if (target.platform === message.platform && target.channelId === message.channelId) {
          continue; // Don't echo back to the same channel
        }

        const targetAdapter = this.adapters.get(target.platform);
        if (!targetAdapter) {
          console.warn(`[BridgeEngine] Adapter for ${target.platform} not found`);
          continue;
        }

        const prefix = link.options?.prefixAuthorName !== false
          ? `[${message.author.displayName} via ${message.platform}]: `
          : '';

        const outbound: OutboundMessage = {
          platform: target.platform,
          channelId: target.channelId,
          text: `${prefix}${message.text}`,
          attachments: message.attachments,
          metadata: {
            isBridgeEcho: true,
            bridgeId: link.id,
            originMessageId: message.id,
          },
        };

        try {
          await targetAdapter.send(outbound);
        } catch (err) {
          console.error(`[BridgeEngine] Failed forwarding message to ${target.platform}/${target.channelId}:`, err);
        }
      }
    }
  }
}
