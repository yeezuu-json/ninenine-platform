import { Module } from '@nestjs/common';
import { ConfigModule } from '@ninenine/config';

@Module({
  imports: [ConfigModule],
})
export class AppModule {}
