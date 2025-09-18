import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, RawBodyRequest } from '@nestjs/common';
import { envs } from './config';
import { json, urlencoded } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments MS');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Enable raw body for webhooks
  // app.use(json({
  //   verify: (req: any, res, buf) => {
  //     if (req.originalUrl.includes('webhook')) {
  //       req.rawBody = buf.toString();
  //     }
  //   },
  // }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    {
      inheritAppConfig: true,
    }
  );

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`MicroService is running on ${envs.port}`);
}
bootstrap();
