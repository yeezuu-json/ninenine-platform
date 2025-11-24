import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoEightyEntity } from './persistence/entities/lotto-eighty.entity';
import { LottoEightyRepository } from './persistence/repositories/lotto-eighty.repository';

// Symbol tokens for dependency injection
export const LOTTO_EIGHTY_REPOSITORY = Symbol('ILottoEightyRepository');

// Bindings the repository implementations to their interfaces
const repositoryProviders: Provider[] = [
  {
    provide: LOTTO_EIGHTY_REPOSITORY,
    useClass: LottoEightyRepository,
  },
];

@Module({
  imports: [
    // Register entities with TypeORM
    TypeOrmModule.forFeature([LottoEightyEntity]),
  ],
  providers: [...repositoryProviders],
  exports: [
    // Export the symbol token for injection in other modules
    LOTTO_EIGHTY_REPOSITORY,
  ],
})
export class GameEnginePersistenceModule {}
