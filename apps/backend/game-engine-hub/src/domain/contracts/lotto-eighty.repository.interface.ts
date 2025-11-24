import { LottoEighty } from '../entities/lotto-eighty.entity';
import { IPaginatedResult } from '@ninenine/contracts';

export interface ILottoEightyRepository {
  findById(id: string): Promise<LottoEighty | null>;

  findPaginated(
    limit: number,
    offset: number
  ): Promise<IPaginatedResult<LottoEighty>>;

  findCurrentRound(): Promise<LottoEighty | null>;

  findLatestSettledRound(): Promise<LottoEighty | null>;

  findLatestTodayRound(): Promise<LottoEighty | null>;

  findIncompleteRounds(): Promise<LottoEighty[]>;

  save(round: LottoEighty): Promise<LottoEighty>;
}
