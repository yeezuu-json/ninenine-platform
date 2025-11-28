export * from './lib/database.module';
export * from './lib/base/';

// Re-export transaction decorator for convenience
export { Transactional } from 'typeorm-transactional';
