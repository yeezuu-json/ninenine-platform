import { LottoStatus } from '@ninenine/game-engine';

export class CurrentRoundDto {
  id!: string;
  roundNumber!: string;
  drawnNumbers?: number[] | null;
  sum!: number | null;
  ouResult!: string | null;
  rangeResult!: string | null;
  isJackpot!: boolean;
  jackpotOnRange!: string | null;
  status!: LottoStatus;
  openedAt!: Date;
  closedAt!: Date | null;
  drawnAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
