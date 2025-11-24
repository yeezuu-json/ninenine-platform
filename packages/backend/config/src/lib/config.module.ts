import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateConfig } from './config.validation';
import appConfig from './app-config/app.config';
import databaseConfig from './db-config/db.config';
import redisConfig from './redis-config/redis.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      validate: validateConfig,
      cache: true,
      expandVariables: true,
    }),
  ],
})
export class ConfigModule {}
