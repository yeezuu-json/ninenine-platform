import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('lotto_eighties')
export class LottoEightyEntity {
  // Base fields (copied from BaseEntity)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

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
}
