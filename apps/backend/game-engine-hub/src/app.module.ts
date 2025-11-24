import { Module } from '@nestjs/common';
import { ConfigModule } from '@ninenine/config';
import { DatabaseModule } from '@ninenine/database';
import { join } from 'path';
import { GameEnginePersistenceModule } from './infrastructure/gane-engine-persistence.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule.forRoot({
      entities: [
        join(
          __dirname,
          'infrastructure/persistence/entities/*.entity{.ts,.js}'
        ),
      ],
      synchronize: false,
      migrationsPath: join(
        __dirname,
        '../../../packages/backend/database/src/lib/migrations/*{.ts,.js}'
      ),
      migrationsRun: false,
      logging: true,
    }),
    GameEnginePersistenceModule,
  ],
})
export class AppModule {}
