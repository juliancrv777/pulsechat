import {Injectable,Logger,OnModuleDestroy} from '@nestjs/common';import {createClient,type RedisClientType} from 'redis';
@Injectable()
export class RedisService implements OnModuleDestroy{
  private readonly logger=new Logger(RedisService.name);
  private client?:RedisClientType;
  private readonly duplicates=new Set<RedisClientType>();
  private connectionUrl(){
    const raw=process.env.REDIS_URL;
    if(!raw)return undefined;
    const url=new URL(raw);
    // Upstash's CLI example uses `redis://` together with `--tls`. node-redis
    // expresses the same TLS requirement through the `rediss://` scheme.
    if(url.protocol==='redis:'&&url.hostname.endsWith('.upstash.io'))url.protocol='rediss:';
    return url.toString();
  }
  async getClient(){
    const url=this.connectionUrl();
    if(!url)return undefined;
    if(!this.client){
      const client=createClient({url,socket:{connectTimeout:10_000,reconnectStrategy:false}});
      client.on('error',e=>this.logger.error(`Redis error: ${e.message}`));
      await client.connect();
      this.client=client as RedisClientType;
      this.logger.log('Redis connection established');
    }
    return this.client;
  }
  async duplicate(){
    const client=await this.getClient();
    if(!client)return undefined;
    const duplicate=client.duplicate({socket:{connectTimeout:10_000,reconnectStrategy:false}}) as RedisClientType;
    duplicate.on('error',e=>this.logger.error(`Redis subscriber error: ${e.message}`));
    await duplicate.connect();
    this.duplicates.add(duplicate);
    return duplicate;
  }
  async onModuleDestroy(){
    await Promise.all([...this.duplicates].filter(c=>c.isOpen).map(c=>c.quit()));
    if(this.client?.isOpen)await this.client.quit();
  }
}
