import { DynamicModule, Module } from '@nestjs/common';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '@ninenine/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

export interface DatabaseConnectionOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface DatabaseModuleOptions {
  /**
   * Optional connection name for multiple database setup
   * Leave undefined for default connection
   */
  name?: string;

  /**
   * Entity patterns to load (glob patterns or entity classes)
   */
  entities: (string | Function)[];

  /**
   * Optional migrations path
   */
  migrationsPath?: string;

  /**
   * Auto synchronize schema (use only in development)
   */
  synchronize?: boolean;

  /**
   * Enable query logging
   */
  logging?: boolean;

  /**
   * Auto run migrations on startup
   */
  migrationsRun?: boolean;

  /**
   * Override database connection config
   * If provided, these values take precedence over ConfigService
   */
  connection?: DatabaseConnectionOptions;
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          name: options.name,
          inject: [ConfigService],
          useFactory: async (
            cfg: ConfigService<AllConfig>
          ): Promise<TypeOrmModuleOptions> => {
            const db = cfg.get('db', { infer: true });

            // Use override values if provided, otherwise fall back to config
            const config: PostgresConnectionOptions = {
              type: 'postgres',
              host: options.connection?.host ?? db?.DB_HOST,
              port: options.connection?.port ?? db?.DB_PORT,
              username: options.connection?.username ?? db?.DB_USERNAME,
              password: options.connection?.password ?? db?.DB_PASSWORD,
              database: options.connection?.database ?? db?.DB_DATABASE,
              ssl: options.connection?.ssl,
              entities: options.entities,
              migrations: options.migrationsPath
                ? [options.migrationsPath]
                : undefined,
              synchronize: options.synchronize ?? false,
              logging: options.logging ?? db?.DB_LOGGING ?? false,
              migrationsRun: options.migrationsRun ?? false,
            };

            return config;
          },
          dataSourceFactory: async (typeormOptions) => {
            if (!typeormOptions) {
              throw new Error('Invalid TypeORM options');
            }
            return addTransactionalDataSource(new DataSource(typeormOptions));
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }

  /**
   * Register multiple database connections
   * @example
   * DatabaseModule.forMultiple([
   *   { name: 'default', entities: [...], database: 'main_db' },
   *   { name: 'analytics', entities: [...], connection: { database: 'analytics_db' } }
   * ])
   */
  static forMultiple(connections: DatabaseModuleOptions[]): DynamicModule {
    return {
      module: DatabaseModule,
      imports: connections.map((options) =>
        TypeOrmModule.forRootAsync({
          name: options.name,
          inject: [ConfigService],
          useFactory: async (
            cfg: ConfigService<AllConfig>
          ): Promise<TypeOrmModuleOptions> => {
            const db = cfg.get('db', { infer: true });

            const config: PostgresConnectionOptions = {
              type: 'postgres',
              host: options.connection?.host ?? db?.DB_HOST,
              port: options.connection?.port ?? db?.DB_PORT,
              username: options.connection?.username ?? db?.DB_USERNAME,
              password: options.connection?.password ?? db?.DB_PASSWORD,
              database: options.connection?.database ?? db?.DB_DATABASE,
              ssl: options.connection?.ssl,
              entities: options.entities,
              migrations: options.migrationsPath
                ? [options.migrationsPath]
                : undefined,
              synchronize: options.synchronize ?? false,
              logging: options.logging ?? db?.DB_LOGGING ?? false,
              migrationsRun: options.migrationsRun ?? false,
            };

            return config;
          },
          dataSourceFactory: async (typeormOptions) => {
            if (!typeormOptions) {
              throw new Error('Invalid TypeORM options');
            }
            return addTransactionalDataSource(new DataSource(typeormOptions));
          },
        })
      ),
      exports: [TypeOrmModule],
    };
  }
}
