import type {
  Lotto80Range,
  Lotto80OverUnder,
  LottoStatus,
} from '@ninenine/game-engine';

/**
 * Round opened for betting (30 seconds)
 */
export class Lotto80RoundOpenedEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly durationSeconds: number,
    public readonly openedAt: Date,
    public readonly serverTime: Date
  ) {}
}

/**
 * Countdown tick during OPEN phase (every 1 second)
 */
export class Lotto80CountdownEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly countdown: number,
    public readonly serverTime: Date
  ) {}
}

/**
 * Drawing phase started
 */
export class Lotto80DrawingStartedEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly isJackpot: boolean,
    public readonly jackpotOnRange: Lotto80Range | null,
    public readonly serverTime: Date
  ) {}
}

/**
 * Single ball drawn and announced
 */
export class Lotto80DrawingBallEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly ball: number,
    public readonly position: number,
    public readonly cumulativeSum: number,
    public readonly serverTime: Date
  ) {}
}

/**
 * Delay between ball announcements
 */
export class Lotto80DrawingDelayEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly processDelay: number,
    public readonly serverTime: Date
  ) {}
}

/**
 * Drawing complete, showing final results
 */
export class Lotto80RoundFinishedEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly drawnNumbers: number[],
    public readonly sum: number,
    public readonly drawnAt: Date,
    public readonly ouResult: Lotto80OverUnder,
    public readonly rangeResult: Lotto80Range,
    public readonly isJackpot: boolean,
    public readonly jackpotOnRange: Lotto80Range | null,
    public readonly jackpotHit: boolean,
    public readonly serverTime: Date
  ) {}
}

/**
 * Round settled, payouts distributed
 */
export class Lotto80RoundSettledEvent {
  constructor(
    public readonly roundId: string,
    public readonly roundNumber: string,
    public readonly status: LottoStatus,
    public readonly serverTime: Date
  ) {}
}
