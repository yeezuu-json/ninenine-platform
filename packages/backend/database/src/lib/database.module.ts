import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllConfig } from '@ninenine/config';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService<AllConfig>) => {
        const db = cfg.get('db', { infer: true });

        return {
          type: 'postgres',
          host: db?.DB_HOST,
          port: db?.DB_PORT,
          username: db?.DB_USERNAME,
          password: db?.DB_PASSWORD,
          database: db?.DB_DATABASE,
          entities: [
            join(
              process.cwd(),
              '/dist/packages/backend/**/src/**/*.entity{.ts,.js}'
            ),
          ],
          // synchronize: true,
          migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          migrationsRun: true,
          logging: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
