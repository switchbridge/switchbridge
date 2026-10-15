import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BaseAdapter } from '../adapters/base.js';
import { BridgeEngine } from '../engine/bridge.js';
import { OutboundMessage, UnifiedMessage } from '../types/message.js';

class MockAdapter extends BaseAdapter {
  public sentMessages: OutboundMessage[] = [];

  constructor(public readonly platform: string, public readonly name: string) {
    super();
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {}

  async send(message: OutboundMessage): Promise<{ externalMessageId: string }> {
    this.sentMessages.push(message);
    return { externalMessageId: 'mock-123' };
  }

  protected normalizeIncoming(raw: any): UnifiedMessage {
    return raw;
  }

  public simulateIncoming(msg: UnifiedMessage) {
    this.emit('message', msg);
  }
}

describe('BridgeEngine', () => {
  it('should forward message from Telegram to Discord with prefix', async () => {
    const tg = new MockAdapter('telegram', 'TelegramMock');
    const discord = new MockAdapter('discord', 'DiscordMock');

    const engine = new BridgeEngine([tg, discord]);
    engine.addBridgeLink({
      id: 'bridge-1',
      endpoints: [
        { platform: 'telegram', channelId: 'tg-chat-1' },
        { platform: 'discord', channelId: 'dc-chan-1' },
      ],
    });

    // Simulate user writing in Telegram
    tg.simulateIncoming({
      id: 'msg-1',
      platform: 'telegram',
      channelId: 'tg-chat-1',
      author: { id: 'user-1', displayName: 'Alex', isBot: false },
      text: 'Hello Discord!',
      timestamp: new Date(),
    });

    // Wait a tick for async handler
    await new Promise((r) => setTimeout(r, 20));

    assert.strictEqual(discord.sentMessages.length, 1);
    assert.strictEqual(discord.sentMessages[0].channelId, 'dc-chan-1');
    assert.strictEqual(discord.sentMessages[0].text, '[Alex via telegram]: Hello Discord!');
    assert.strictEqual(tg.sentMessages.length, 0); // No echo back to telegram
  });
});
