import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;

  private redisUrl() {
    const raw = process.env.REDIS_URL?.trim().replace(/^["']|["']$/g, '');
    if (!raw) return undefined;

    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new Error('REDIS_URL must be a valid Redis URL');
    }

    if (url.protocol !== 'redis:' && url.protocol !== 'rediss:') {
      throw new Error('REDIS_URL must use redis:// or rediss://');
    }

    // Upstash's native endpoint requires TLS. Its redis-cli example expresses
    // this as "--tls -u redis://..."; node-redis expresses it as rediss://.
    if (url.hostname.endsWith('.upstash.io') && url.protocol === 'redis:') {
      url.protocol = 'rediss:';
    }

    return url.toString();
  }

  async getClient() {
    const url = this.redisUrl();
    if (!url) return undefined;

    if (!this.client) {
      const client = createClient({
        url,
        socket: {
          connectTimeout: 10_000,
          reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 200, 1_000)),
        },
      });
      client.on('error', (error) => this.logger.error(`Redis error: ${error.message}`));
      await client.connect();
      this.client = client as RedisClientType;
    }

    return this.client;
  }

  async duplicate() {
    const client = await this.getClient();
    if (!client) return undefined;
    const duplicate = client.duplicate();
    await duplicate.connect();
    return duplicate;
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) await this.client.quit();
  }
}
