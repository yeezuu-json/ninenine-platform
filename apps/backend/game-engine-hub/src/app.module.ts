import { Module } from '@nestjs/common';
import { ConfigModule } from '@ninenine/config';
import { DatabaseModule } from '@ninenine/database';
import { join } from 'path';
import { Lotto80Module } from './engines/lotto80/lotto80.module';
import { Lotto80Entity } from './engines/lotto80/infrastructure/persistence/entities/lotto80.entity';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule.forRoot({
      entities: [Lotto80Entity],
      synchronize: false,
      migrationsPath: join(
        __dirname,
        '../../../packages/backend/database/src/lib/migrations/*{.ts,.js}'
      ),
      migrationsRun: false,
      logging: true,
    }),
    Lotto80Module,
  ],
})
export class AppModule {}
