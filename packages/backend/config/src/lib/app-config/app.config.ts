import { registerAs } from '@nestjs/config';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class AppConfiguration {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT!: number;

  @IsString()
  APP_NAME!: string;

  @IsString()
  API_PREFIX!: string;

  @IsString()
  API_VERSION!: string;
}

export default registerAs('app', () => {
  const config = plainToInstance(
    AppConfiguration,
    {
      NODE_ENV:
        (process.env.NODE_ENV as Environment) || Environment.Development,
      PORT: parseInt(process.env.PORT || '3000', 10),
      APP_NAME: process.env.APP_NAME || 'lotto80',
      API_PREFIX: process.env.API_PREFIX || 'api',
      API_VERSION: process.env.API_VERSION || 'v1',
    },
    {
      enableImplicitConversion: true,
    }
  );
  return config;
});

export type AppConfig = AppConfiguration;
