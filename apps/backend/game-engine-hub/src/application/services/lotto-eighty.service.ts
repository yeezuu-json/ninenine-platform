import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@ninenine/database';
import type { ILottoEightyRepository } from '../../domain/contracts/lotto-eighty.repository.interface';
import { LOTTO_EIGHTY_REPOSITORY } from '../../infrastructure/gane-engine-persistence.module';
import { LottoEighty } from '../../domain/entities/lotto-eighty.entity';

@Injectable()
export class LottoEightyService {
  constructor(
    @Inject(LOTTO_EIGHTY_REPOSITORY)
    private readonly lottoEightyRepository: ILottoEightyRepository
  ) {}

  async getCurrentRound(): Promise<LottoEighty | null> {
    return this.lottoEightyRepository.findCurrentRound();
  }

  async getRoundById(id: string): Promise<LottoEighty | null> {
    return this.lottoEightyRepository.findById(id);
  }

  @Transactional()
  async createRound(round: LottoEighty): Promise<LottoEighty> {
    // Any error thrown here will automatically rollback the transaction
    return this.lottoEightyRepository.save(round);
  }

  @Transactional()
  async createMultipleRounds(rounds: LottoEighty[]): Promise<LottoEighty[]> {
    // All saves happen in one transaction
    const results: LottoEighty[] = [];
    for (const round of rounds) {
      const saved = await this.lottoEightyRepository.save(round);
      results.push(saved);
    }
    return results; // Auto-commit if no errors
  }
}
