import {Injectable,Logger,OnModuleDestroy} from '@nestjs/common';import {createClient,type RedisClientType} from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy{
  private readonly logger=new Logger(RedisService.name);
  private client?:RedisClientType;

  private connectionUrl(){
    const raw=process.env.REDIS_URL?.trim();
    if(!raw)return undefined;
    try{
      const parsed=new URL(raw);
      if(parsed.protocol==='redis:'&&parsed.hostname.endsWith('.upstash.io')){
        parsed.protocol='rediss:';
        this.logger.log('TLS enabled for Upstash Redis connection');
      }
      return parsed.toString();
    }catch{
      throw new Error('REDIS_URL must be a valid redis:// or rediss:// URL');
    }
  }

  async getClient(){
    const url=this.connectionUrl();
    if(!url)return undefined;
    if(!this.client){
      const client=createClient({url,socket:{connectTimeout:10_000,reconnectStrategy:false}});
      client.on('error',e=>this.logger.error(`Redis error: ${e.message}`));
      await client.connect();
      this.client=client as RedisClientType;
    }
    return this.client;
  }

  async duplicate(){
    const client=await this.getClient();
    if(!client)return undefined;
    const duplicate=client.duplicate({socket:{connectTimeout:10_000,reconnectStrategy:false}});
    duplicate.on('error',e=>this.logger.error(`Redis subscriber error: ${e.message}`));
    await duplicate.connect();
    return duplicate;
  }

  async onModuleDestroy(){if(this.client?.isOpen)await this.client.quit()}
}
