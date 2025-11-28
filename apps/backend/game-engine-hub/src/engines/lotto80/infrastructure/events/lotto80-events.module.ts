import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '@ninenine/config';
import Redis from 'ioredis';
import { RedisGameEventsPublisher } from './redis.publisher';

export const GAME_EVENTS_PUBLISHER = Symbol('GameEventsPublisher');

const bindings: Provider[] = [
  // Provide Redis client
  {
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
  },
  // Provide Redis implementation for GameEventsPublisher
  {
    provide: GAME_EVENTS_PUBLISHER,
    useClass: RedisGameEventsPublisher,
  },
  // Also provide by string token for compatibility
  {
    provide: 'GameEventsPublisher',
    useExisting: GAME_EVENTS_PUBLISHER,
  },
  // Provide Redis as dependency for RedisGameEventsPublisher
  {
    provide: Redis,
    useExisting: 'REDIS_CLIENT',
  },
];

@Module({
  providers: [...bindings],
  exports: [GAME_EVENTS_PUBLISHER, 'GameEventsPublisher'],
})
export class Lotto80EventsModule {}
