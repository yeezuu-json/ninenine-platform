import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WebSocket connections
  app.enableCors({
    origin: '*', // Configure based on your frontend domain in production
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3005;

  await app.listen(port);

  Logger.log(
    `🚀 HTTP Server running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`🔌 WebSocket Server running on: ws://localhost:${port}/lotto80`);
}

bootstrap();
