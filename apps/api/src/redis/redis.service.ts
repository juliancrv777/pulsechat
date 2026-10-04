import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

function stripOuterQuotes(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function normalizeRedisUrl(value: string) {
  const raw = stripOuterQuotes(value);

  if (!raw) {
    return undefined;
  }

  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') {
    return undefined;
  }

  if (
    parsed.protocol === 'redis:' &&
    parsed.hostname.toLowerCase().endsWith('.upstash.io')
  ) {
    parsed.protocol = 'rediss:';
  }

  return parsed.toString();
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;
  private readonly duplicateClients = new Set<RedisClientType>();

  async getClient() {
    const rawRedisUrl = process.env.REDIS_URL;

    if (!rawRedisUrl?.trim()) {
      return undefined;
    }

    const redisUrl = normalizeRedisUrl(rawRedisUrl);

    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL must be a valid redis:// or rediss:// URL. Redis integration disabled; API will continue in single-instance mode.',
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

        if (
          /^redis:\/\//i.test(stripOuterQuotes(rawRedisUrl)) &&
          /^rediss:\/\//i.test(redisUrl)
        ) {
          this.logger.log('Upstash Redis detected; TLS enabled automatically');
        }

        this.logger.log('Redis connection established');
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

    const duplicate = client.duplicate({
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: false,
      },
    }) as RedisClientType;

    duplicate.on('error', (error) =>
      this.logger.error(`Redis subscriber error: ${error.message}`),
    );

    try {
      await duplicate.connect();
      this.duplicateClients.add(duplicate);
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

  private async closeClient(client: RedisClientType, label: string) {
    if (!client.isOpen) {
      return;
    }

    try {
      await client.quit();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to close Redis ${label} cleanly: ${message}`);
      client.destroy();
    }
  }

  async onModuleDestroy() {
    const duplicateClients = [...this.duplicateClients];
    this.duplicateClients.clear();

    await Promise.all(
      duplicateClients.map((client) => this.closeClient(client, 'subscriber')),
    );

    if (this.client) {
      await this.closeClient(this.client, 'client');
      this.client = undefined;
    }
  }
}
