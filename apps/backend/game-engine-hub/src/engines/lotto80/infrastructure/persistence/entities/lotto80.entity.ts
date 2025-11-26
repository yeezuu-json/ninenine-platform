import { BaseEntity } from '@ninenine/database';
import { Column, Entity, Index } from 'typeorm';

@Entity('lotto80_rounds')
@Index('idx_lotto80_status', ['status'])
@Index('idx_lotto80_opened_at', ['openedAt'])
@Index('idx_lotto80_status_opened_at', ['status', 'openedAt'])
@Index('idx_lotto80_drawn_at', ['drawnAt'])
@Index('idx_lotto80_jackpot', ['isJackpot', 'jackpotOn'])
export class Lotto80Entity extends BaseEntity {
  // Domain-specific fields
  @Column({ name: 'round_number', type: 'varchar', length: 12, unique: true })
  roundNumber!: string;

  @Column({
    type: 'enum',
    enum: ['OPEN', 'DRAWING', 'FINISHED', 'SETTLED', 'VOIDED'],
    default: 'OPEN',
  })
  status!: string;

  @Column({ name: 'opened_at', type: 'timestamptz' })
  openedAt!: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @Column({ name: 'drawn_numbers', type: 'jsonb', nullable: true })
  drawnNumbers!: number[] | null;

  @Column({ name: 'drawn_at', type: 'timestamptz', nullable: true })
  drawnAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  sum!: number | null;

  @Column({
    name: 'over_under',
    type: 'enum',
    enum: ['OVER', 'UNDER'],
    nullable: true,
  })
  overUnder!: string | null;

  @Column({
    name: 'range',
    type: 'enum',
    enum: ['RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5'],
    nullable: true,
  })
  range!: string | null;

  @Column({ name: 'is_jackpot', type: 'boolean', default: false })
  isJackpot!: boolean;

  @Column({
    name: 'jackpot_on',
    type: 'enum',
    enum: ['RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5'],
    nullable: true,
  })
  jackpotOn!: string | null;

  @Column({ name: 'rng_seed', type: 'varchar', length: 128, nullable: true })
  rngSeed!: string | null;

  @Column({ name: 'rng_algo_version', type: 'int', default: 1 })
  rngAlgoVersion!: number;
}
