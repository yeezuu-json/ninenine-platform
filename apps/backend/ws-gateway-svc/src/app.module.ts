import { Module } from '@nestjs/common';
import { RedisModule } from './shared/redis.module';
import { Lotto80Module } from './lotto80/lotto80.module';

@Module({
  imports: [RedisModule, Lotto80Module],
})
export class AppModule {}
