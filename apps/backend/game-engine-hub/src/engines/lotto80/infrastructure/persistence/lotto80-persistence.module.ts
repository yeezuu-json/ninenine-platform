import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, Provider } from '@nestjs/common';
// Entities
import { Lotto80Entity } from './entities/lotto80.entity';

// Repositories
import { Lotto80Repository } from './repositories/lotto80.repository';

export const LOTTO80_REPOSITORY = Symbol('ILotto80Repository');

const bindings: Provider[] = [
  // Register concrete repository
  Lotto80Repository,
  // Bind interface to implementation
  {
    provide: LOTTO80_REPOSITORY,
    useExisting: Lotto80Repository,
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([Lotto80Entity])],
  providers: [...bindings],
  exports: [...bindings],
})
export class Lotto80PersistenceModule {}
