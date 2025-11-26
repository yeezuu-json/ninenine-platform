import {
  LOTTO80_OVER_UNDER_THRESHOLD,
  Lotto80OverUnder,
  Lotto80Range,
  LottoStatus,
  sumLotto80Range,
} from '../enums/index.enum';
import { RoundNumber } from '../value-objects/round-number.vo';
import { Lotto80Numbers } from '../value-objects/lotto80-numbers.vo';

export interface ILotto80Props {
  readonly id: string;
  roundNumber: RoundNumber;
  drawnNumbers: Lotto80Numbers | null;
  sum: number | null;
  drawnAt: Date | null;
  status: LottoStatus;
  overUnder: Lotto80OverUnder | null;
  range: Lotto80Range | null;
  isJackpot: boolean;
  jackpotOn: Lotto80Range | null;
  closedAt: Date | null;
  readonly openedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  rngSeed: string | null;
  rngAlgoVersion: number;
}

// Aggregate Root
export class Lotto80 {
  constructor(private props: ILotto80Props) {}

  // Factory methods
  static create(
    id: string,
    roundNumber: RoundNumber,
    isJackpot: boolean,
    jackpotOn: Lotto80Range | null,
    rngSeed: string | null,
    rngAlgoVersion = 1
  ): Lotto80 {
    const now = new Date();
    return new Lotto80({
      id,
      roundNumber,
      drawnNumbers: null,
      sum: null,
      drawnAt: null,
      status: LottoStatus.OPEN,
      overUnder: null,
      range: null,
      isJackpot,
      jackpotOn,
      closedAt: null,
      openedAt: now,
      createdAt: now,
      updatedAt: now,
      rngSeed,
      rngAlgoVersion,
    });
  }

  static reconstitute(props: ILotto80Props): Lotto80 {
    return new Lotto80(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get roundNumber(): RoundNumber {
    return this.props.roundNumber;
  }

  get drawnNumbers(): Lotto80Numbers | null {
    return this.props.drawnNumbers;
  }

  get sum(): number | null {
    return this.props.sum;
  }
  get drawnAt(): Date | null {
    return this.props.drawnAt;
  }
  get status(): LottoStatus {
    return this.props.status;
  }

  get overUnder(): Lotto80OverUnder | null {
    return this.props.overUnder;
  }

  get range(): Lotto80Range | null {
    return this.props.range;
  }

  get isJackpot(): boolean {
    return this.props.isJackpot;
  }

  get jackpotOn(): Lotto80Range | null {
    return this.props.jackpotOn;
  }

  get closedAt(): Date | null {
    return this.props.closedAt;
  }

  get openedAt(): Date {
    return this.props.openedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get rngSeed(): string | null {
    return this.props.rngSeed;
  }

  get rngAlgoVersion(): number {
    return this.props.rngAlgoVersion;
  }

  // Methods to update state can be added here

  /**
   * Start drawing process (initialize empty balls, set status to DRAWING, etc.)
   */
  startDrawing(): void {
    if (this.props.status !== LottoStatus.OPEN) {
      throw new Error('Cannot start drawing: Lotto80 is not open.');
    }

    this.props.status = LottoStatus.DRAWING;
    this.props.drawnNumbers = new Lotto80Numbers([]);
    this.props.closedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Add a single ball incrementally during drawing
   */
  addBall(ball: number): void {
    if (this.props.status !== LottoStatus.DRAWING) {
      throw new Error('Cannot add ball: Lotto80 is not in drawing status.');
    }

    const currentNumbers = this.props.drawnNumbers?.getNumbers() ?? [];

    if (currentNumbers.includes(ball)) {
      throw new Error(`Ball number ${ball} has already been drawn.`);
    }

    if (currentNumbers.length >= 20) {
      throw new Error('Cannot add more than 20 balls.');
    }

    // Add the new ball
    this.props.drawnNumbers = new Lotto80Numbers([...currentNumbers, ball]);
    this.props.updatedAt = new Date();

    // Calculate results on the 20th ball
    if (this.props.drawnNumbers.getCount() === 20) {
      this.props.drawnAt = new Date();
      this.props.sum = this.props.drawnNumbers.calculateSum();
      this.props.overUnder =
        this.props.sum > LOTTO80_OVER_UNDER_THRESHOLD
          ? Lotto80OverUnder.OVER
          : Lotto80OverUnder.UNDER;
      this.props.range = sumLotto80Range(this.props.sum);
    }
  }

  /**
   * Finish drawing and transition to FINISHED status
   */
  finishDrawing(): void {
    if (this.props.status !== LottoStatus.DRAWING) {
      throw new Error(
        'Cannot finish drawing: Lotto80 is not in drawing status.'
      );
    }

    const drawnCount = this.drawnNumbers?.getCount() ?? 0;
    if (drawnCount !== 20) {
      throw new Error(
        `Cannot finish drawing with ${drawnCount} balls. Expected 20.`
      );
    }

    if (!this.props.sum || !this.props.overUnder || !this.props.range) {
      throw new Error(
        'Sum and results must be calculated before finishing drawing.'
      );
    }

    this.props.status = LottoStatus.FINISHED;
    this.props.updatedAt = new Date();
  }

  /**
   * Settle the round after finishing
   */
  settle(): void {
    if (this.props.status !== LottoStatus.FINISHED) {
      throw new Error('Cannot settle: Lotto80 is not finished.');
    }

    this.props.status = LottoStatus.SETTLED;
    this.props.updatedAt = new Date();
  }

  /**
   * Voided the round if any error occurs
   */
  void(): void {
    this.props.status = LottoStatus.VOIDED;
    this.props.updatedAt = new Date();
  }

  /**
   * Set jackpot range (used for mystery jackpot reveal)
   */
  setJackpotOn(range: Lotto80Range): void {
    this.props.jackpotOn = range;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if jackpot was hit
   */
  isJackpotHit(): boolean {
    if (!this.isJackpot || !this.jackpotOn || !this.range) {
      return false;
    }
    return this.range === this.jackpotOn;
  }

  /**
   * Set seed and algorithm version
   */
  setSeed(seed: string, algoVersion = 1): void {
    this.props.rngSeed = seed;
    this.props.rngAlgoVersion = algoVersion;
    this.props.updatedAt = new Date();
  }
}
