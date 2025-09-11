import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, RawBodyRequest } from '@nestjs/common';
import { envs } from './config';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Payments MS');
  const app = await NestFactory.create(AppModule);

  // Enable raw body for webhooks
  app.use(json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl.includes('webhook')) {
        req.rawBody = buf.toString();
      }
    },
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );


  await app.listen(envs.port);

  logger.log(`MicroService is running on ${envs.port}`);
}
bootstrap();
