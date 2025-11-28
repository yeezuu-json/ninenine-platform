import { Lotto80 } from '../agreegates/lotto80.agreegate';
import { IPaginatedResult } from '@ninenine/contracts';

export interface ILotto80Repository {
  findById(id: string): Promise<Lotto80 | null>;

  findPaginated(
    limit: number,
    offset: number
  ): Promise<IPaginatedResult<Lotto80>>;

  findCurrentRound(): Promise<Lotto80 | null>;

  findLatestSettledRound(): Promise<Lotto80 | null>;

  findLatestTodayRound(): Promise<Lotto80 | null>;

  findIncompleteRounds(): Promise<Lotto80[]>;

  findCompletedRounds(limit: number): Promise<Lotto80[]>;

  save(round: Lotto80): Promise<Lotto80>;
}
