import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;

  async getClient() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      return undefined;
    }

    if (!/^rediss?:\/\//i.test(redisUrl)) {
      this.logger.warn(
        'REDIS_URL must use redis:// or rediss://. Redis integration disabled; API will continue in single-instance mode.',
      );
      return undefined;
    }

    if (!this.client) {
      const client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5_000,
          reconnectStrategy: false,
        },
      });

      client.on('error', (error) =>
        this.logger.error(`Redis error: ${error.message}`),
      );

      try {
        await client.connect();
        this.client = client as RedisClientType;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Redis unavailable during startup; continuing without Redis: ${message}`,
        );
        if (client.isOpen) {
          client.destroy();
        }
        return undefined;
      }
    }

    return this.client;
  }

  async duplicate() {
    const client = await this.getClient();
    if (!client) {
      return undefined;
    }

    const duplicate = client.duplicate();

    try {
      await duplicate.connect();
      return duplicate;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis subscriber unavailable; Socket.IO will use single-instance mode: ${message}`,
      );
      if (duplicate.isOpen) {
        duplicate.destroy();
      }
      return undefined;
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }
}
