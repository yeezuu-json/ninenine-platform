import { plainToInstance } from 'class-transformer';
import { validateSync, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppConfiguration } from './app-config/app.config';
import { DatabaseConfiguration } from './db-config/db.config';
import { RedisConfiguration } from './redis-config/redis.config';

export class EnvironmentVariables {
  @ValidateNested()
  @Type(() => AppConfiguration)
  app!: AppConfiguration;

  @ValidateNested()
  @Type(() => DatabaseConfiguration)
  database!: DatabaseConfiguration;

  @ValidateNested()
  @Type(() => RedisConfiguration)
  redis!: RedisConfiguration;
}

export function validateConfig(
  config: Record<string, unknown>
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Config validation error: ${JSON.stringify(errors, null, 2)}`
    );
  }

  return validated;
}
