import {
  calculateRangeFromSum,
  LottoEightyStatus,
  OVER_UNDER_THRESHOLD,
  OverUnder,
  Range,
} from '../enums/lotto-eighty';
import { Numbers } from '../value-objects/numbers';
import { RoundNumber } from './../value-objects/round-number';
export class LottoEighty {
  constructor(
    private readonly id: string,
    private roundNumber: RoundNumber,
    private drawnNumbers: Numbers | null,
    private sum: number | null,
    private drawnAt: Date | null,
    private status: LottoEightyStatus,
    private overUnder: OverUnder | null,
    private range: Range | null,
    private isJackpot: boolean,
    private jackpotOn: Range | null,
    private closedAt: Date | null,
    private readonly openedAt: Date,
    private createdAt: Date,
    private updatedAt: Date
  ) {}

  // Factories methods
  static createNew(
    id: string,
    roundNumber: RoundNumber,
    isJackpot: boolean,
    jackpotOn: Range | null
  ): LottoEighty {
    const now = new Date();
    return new LottoEighty(
      id,
      roundNumber,
      null,
      null,
      null,
      LottoEightyStatus.OPEN,
      null,
      null,
      isJackpot,
      jackpotOn,
      now,
      now,
      now,
      now
    );
  }

  static reconstitute(
    id: string,
    roundNumber: RoundNumber,
    drawnNumbers: Numbers | null,
    sum: number | null,
    drawnAt: Date | null,
    status: LottoEightyStatus,
    overUnder: OverUnder | null,
    range: Range | null,
    isJackpot: boolean,
    jackpotOn: Range | null,
    closedAt: Date | null,
    openedAt: Date,
    createdAt: Date,
    updatedAt: Date
  ): LottoEighty {
    return new LottoEighty(
      id,
      roundNumber,
      drawnNumbers,
      sum,
      drawnAt,
      status,
      overUnder,
      range,
      isJackpot,
      jackpotOn,
      closedAt,
      openedAt,
      createdAt,
      updatedAt
    );
  }

  // Getter
  getId(): string {
    return this.id;
  }

  getRoundNumber(): RoundNumber {
    return this.roundNumber;
  }

  getDrawnNumbers(): Numbers | null {
    return this.drawnNumbers;
  }

  getSum(): number | null {
    return this.sum;
  }

  getDrawnAt(): Date | null {
    return this.drawnAt;
  }

  getStatus(): LottoEightyStatus {
    return this.status;
  }

  getOverUnder(): OverUnder | null {
    return this.overUnder;
  }

  getRange(): Range | null {
    return this.range;
  }

  getIsJackpot(): boolean {
    return this.isJackpot;
  }

  getJackpotOn(): string | null {
    return this.jackpotOn;
  }

  getClosedAt(): Date | null {
    return this.closedAt;
  }

  getOpenedAt(): Date {
    return this.openedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Functions

  /**
   * Start drawing phase (initialize empty ball array)
   */
  startDrawing(): void {
    if (this.status !== LottoEightyStatus.OPEN) {
      throw new Error(
        `Cannot start drawing from ${this.status} status. Must be OPEN.`
      );
    }

    this.status = LottoEightyStatus.DRAWING;
    this.drawnNumbers = new Numbers([]); // Initialize empty array
    this.closedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Add a single ball incrementally during drawing
   */
  addBall(ball: number): void {
    if (this.status !== LottoEightyStatus.DRAWING) {
      throw new Error(
        `Cannot add ball when status is ${this.status}. Must be DRAWING.`
      );
    }

    const currentNumbers = this.drawnNumbers?.getNumbers() ?? [];

    if (currentNumbers.length >= 20) {
      throw new Error('Cannot add more than 20 balls');
    }

    // Add the new ball
    this.drawnNumbers = new Numbers([...currentNumbers, ball]);
    this.updatedAt = new Date();

    // Calculate results on the 20th ball
    if (this.drawnNumbers.getCount() === 20) {
      this.drawnAt = new Date();
      this.sum = this.drawnNumbers.calculateSum();
      this.overUnder =
        this.sum > OVER_UNDER_THRESHOLD ? OverUnder.OVER : OverUnder.UNDER;
      this.range = calculateRangeFromSum(this.sum);
    }
  }

  /**
   * Finish drawing and transition to FINISHED status
   */
  finishDrawing(): void {
    if (this.status !== LottoEightyStatus.DRAWING) {
      throw new Error(
        `Cannot finish drawing from ${this.status} status. Must be DRAWING.`
      );
    }

    const drawnCount = this.drawnNumbers?.getCount() ?? 0;
    if (drawnCount !== 20) {
      throw new Error(
        `Cannot finish drawing with ${drawnCount} balls. Expected 20.`
      );
    }

    if (!this.sum || !this.overUnder || !this.range) {
      throw new Error('Sum and results must be calculated before finishing');
    }

    this.status = LottoEightyStatus.FINISHED;
    this.updatedAt = new Date();
  }

  /**
   * Settle the round (mark payouts complete)
   */
  settle(): void {
    if (this.status !== LottoEightyStatus.FINISHED) {
      throw new Error(
        `Cannot settle from ${this.status} status. Must be FINISHED.`
      );
    }

    this.status = LottoEightyStatus.SETTLED;
    this.updatedAt = new Date();
  }

  /**
   * Void the round (technical error occurred)
   */
  void(): void {
    this.status = LottoEightyStatus.VOIDED;
    this.updatedAt = new Date();
  }

  /**
   * Set jackpot range (used for mystery jackpot reveal)
   */
  setJackpotOn(range: Range): void {
    this.jackpotOn = range;
    this.updatedAt = new Date();
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
}
