import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '@ninenine/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService<AllConfig>);
  const appcfg = cfg.get('app', { infer: true });

  app.setGlobalPrefix(appcfg?.API_PREFIX || 'api');
  const port = appcfg?.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${
      appcfg?.API_PREFIX || 'api'
    }`
  );
}

bootstrap();
