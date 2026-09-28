import 'reflect-metadata';import {Logger,ValidationPipe} from '@nestjs/common';import {NestFactory} from '@nestjs/core';import helmet from 'helmet';import {AppModule} from './app.module';import {RedisIoAdapter} from './redis/redis-io.adapter';import {RedisService} from './redis/redis.service';

async function bootstrap(){
  const app=await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({origin:process.env.WEB_ORIGIN??'http://localhost:3000',credentials:false});
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  const adapter=new RedisIoAdapter(app,app.get(RedisService));
  await adapter.connectToRedis();
  app.useWebSocketAdapter(adapter);
  app.enableShutdownHooks();
  const port=Number(process.env.PORT??process.env.API_PORT??4000);
  await app.listen(port,'0.0.0.0');
  Logger.log(`PulseChat API listening on port ${port}`,'Bootstrap');
}

bootstrap().catch(error=>{
  const message=error instanceof Error?error.stack??error.message:String(error);
  console.error('PulseChat API failed to start:',message);
  process.exitCode=1;
});
