import { registerAs } from '@nestjs/config';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class DatabaseConfiguration {
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsBoolean()
  DB_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  DB_LOGGING: boolean = false;

  @IsNumber()
  DB_MAX_CONNECTIONS: number = 10;

  @IsBoolean()
  DB_SSL_ENABLED: boolean = false;
}

export default registerAs('database', () => {
  const config = plainToInstance(
    DatabaseConfiguration,
    {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
      DB_USERNAME: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_DATABASE: process.env.DB_NAME,
      DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
      DB_LOGGING: process.env.DB_LOGGING === 'true',
      DB_MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      DB_SSL_ENABLED: process.env.DB_SSL_ENABLED === 'true',
    },
    {
      enableImplicitConversion: true,
    },
  );
  return config;
});

export type DatabaseConfig = DatabaseConfiguration;
