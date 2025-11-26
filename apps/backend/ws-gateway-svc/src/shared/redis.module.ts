import { Global, Module, Provider } from '@nestjs/common';
import { AllConfig, ConfigModule } from '@ninenine/config';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

const redisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: (cfg: ConfigService<AllConfig>) => {
    const redisConfig = cfg.get('redis', { infer: true });
    return new Redis({
      host: redisConfig?.REDIS_HOST || 'localhost',
      port: redisConfig?.REDIS_PORT || 6379,
      password: redisConfig?.REDIS_PASSWORD || undefined,
      db: redisConfig?.REDIS_DB || 0,
    });
  },
  inject: [ConfigService],
};

/**
 * Global module providing Redis client to all modules
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
