import { AppConfig } from './app-config';
import { DatabaseConfig } from './db-config';
import { RedisConfig } from './redis-config';

export interface AllConfig {
  app: AppConfig;
  db: DatabaseConfig;
  redis: RedisConfig;
}
