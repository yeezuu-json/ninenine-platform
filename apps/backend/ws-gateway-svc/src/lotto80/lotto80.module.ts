import { Module } from '@nestjs/common';
import { Lotto80Gateway } from './lotto80.gateway';
import { Lotto80RedisSubscriber } from './events/lotto80-redis.subscriber';

@Module({
  providers: [Lotto80Gateway, Lotto80RedisSubscriber],
  exports: [Lotto80Gateway, Lotto80RedisSubscriber],
})
export class Lotto80Module {}
