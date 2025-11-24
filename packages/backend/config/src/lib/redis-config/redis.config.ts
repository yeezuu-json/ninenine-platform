import { registerAs } from '@nestjs/config';
import { IsNumber, IsString, IsBoolean } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class RedisConfiguration {
  @IsString()
  REDIS_HOST!: string;

  @IsNumber()
  REDIS_PORT!: number;

  @IsString()
  REDIS_PASSWORD!: string;

  @IsNumber()
  REDIS_DB!: number;

  @IsNumber()
  REDIS_TTL!: number;

  @IsBoolean()
  REDIS_ENABLE_TLS!: boolean;
}

export default registerAs('redis', () => {
  const config = plainToInstance(
    RedisConfiguration,
    {
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
      REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
      REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
      REDIS_TTL: parseInt(process.env.REDIS_TTL || '3600', 10),
      REDIS_ENABLE_TLS: process.env.REDIS_ENABLE_TLS === 'true',
    },
    {
      enableImplicitConversion: true,
    }
  );
  return config;
});

export type RedisConfig = RedisConfiguration;
