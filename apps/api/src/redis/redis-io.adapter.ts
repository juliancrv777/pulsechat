import { Logger } from '@nestjs/common';
import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisService } from './redis.service';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private readonly redisLogger = new Logger(RedisIoAdapter.name);

  constructor(
    app: INestApplicationContext,
    private readonly redis: RedisService,
  ) {
    super(app);
  }

  async connectToRedis() {
    const pub = await this.redis.getClient();

    if (!pub) {
      this.redisLogger.warn(
        'Redis unavailable; Socket.IO is running in single-instance mode',
      );
      return;
    }

    const sub = await this.redis.duplicate();

    if (!sub) {
      return;
    }

    this.adapterConstructor = createAdapter(pub, sub);
    this.redisLogger.log('Socket.IO Redis adapter enabled');
  }

  createIOServer(port: number, options?: Record<string, unknown>) {
    const server = super.createIOServer(port, options);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
