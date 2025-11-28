import { registerAs } from '@nestjs/config';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class DatabaseConfiguration {
  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_DATABASE!: string;

  @IsBoolean()
  DB_SYNCHRONIZE!: boolean;

  @IsBoolean()
  DB_LOGGING!: boolean;

  @IsNumber()
  DB_MAX_CONNECTIONS!: number;

  @IsBoolean()
  DB_SSL_ENABLED!: boolean;
}

export default registerAs('db', () => {
  const config = plainToInstance(
    DatabaseConfiguration,
    {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
      DB_USERNAME: process.env.DB_USERNAME || '',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      DB_DATABASE: process.env.DB_DATABASE,
      DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
      DB_LOGGING: process.env.DB_LOGGING === 'true',
      DB_MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      DB_SSL_ENABLED: process.env.DB_SSL_ENABLED === 'true',
    },
    {
      enableImplicitConversion: true,
    }
  );
  return config;
});

export type DatabaseConfig = DatabaseConfiguration;
