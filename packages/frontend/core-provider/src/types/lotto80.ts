/**
 * Lotto80 Game Types
 *
 * Defines all TypeScript interfaces and types for the Lotto80 game system.
 * Maps to backend WebSocket events and HTTP API responses.
 */

// ============================================================================
// PHASE & STATUS
// ============================================================================

/**
 * Game phase represents the current state of a round
 * - IDLE: Waiting for first round or between rounds
 * - OPEN: Betting phase (30 seconds)
 * - COUNTDOWN: Countdown ticking down
 * - DRAWING: Drawing 20 balls (40 seconds with 2s delays)
 * - FINISHED: Results displayed (3 seconds)
 * - SETTLED: Payouts complete, round closed
 */
export type LottoPhase =
  | 'IDLE'
  | 'OPEN'
  | 'COUNTDOWN'
  | 'DRAWING'
  | 'FINISHED'
  | 'SETTLED';

/**
 * Backend status mapping (from engine.gateway.ts):
 * - OPEN -> phase: 'OPEN' or 'COUNTDOWN'
 * - DRAWING -> phase: 'DRAWING'
 * - FINISHED -> phase: 'FINISHED'
 * - SETTLED -> phase: 'SETTLED'
 */
export type LottoStatus =
  | 'OPEN'
  | 'DRAWING'
  | 'FINISHED'
  | 'SETTLED'
  | 'VOIDED';

/**
 * Over/Under result
 */
export type OverUnder = 'OVER' | 'UNDER';

/**
 * Range result (1-16, 17-32, 33-48, 49-64, 65-80)
 */
export type Range = 'RANGE_1' | 'RANGE_2' | 'RANGE_3' | 'RANGE_4' | 'RANGE_5';

// ============================================================================
// BALL & DRAWING
// ============================================================================

/**
 * A drawn ball with its position and cumulative sum
 */
export interface LottoBall {
  /** Position in sequence (1-20) */
  position: number;
  /** Ball number (1-80) */
  number: number;
  /** Cumulative sum after this ball */
  sumAfter: number;
}

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * Complete game state
 * This is the single source of truth for all UI components
 */
export interface LottoGameState {
  // Round identification
  roundId: string | null;
  roundNumber: string | null;
  phase: LottoPhase;

  // Timing
  secondsRemaining: number | null;
  totalCountdownSeconds: number | null;
  serverTime: Date | null;

  // Drawing
  balls: LottoBall[];
  currentSum: number;
  showingDelay: boolean; // True when showing gray cycling, false when showing blue ball

  // Results (only available in FINISHED/SETTLED phases)
  finalSum: number | null;
  ouResult: OverUnder | null;
  rangeResult: Range | null;

  // Jackpot
  isJackpot: boolean;
  jackpotOnRange: Range | null;
  jackpotHit: boolean;

  // Previous round (for displaying results during countdown)
  previousRound: {
    roundNumber: string;
    balls: LottoBall[];
    finalSum: number;
    ouResult: OverUnder;
    rangeResult: Range;
    isJackpot: boolean;
    jackpotOnRange: Range | null;
    jackpotHit: boolean;
  } | null;
}

// ============================================================================
// WEBSOCKET EVENTS (from backend engine.gateway.ts)
// ============================================================================

/**
 * Event: round:opened
 * Emitted when new round is created and opened for betting
 *
 * Backend source: EngineGateway.handleRoundOpened()
 */
export interface RoundOpenedEvent {
  roundId: string;
  roundNumber: string;
  status: 'OPEN';
  openDurationSeconds: number; // 30
  serverTime: string; // ISO timestamp
}

/**
 * Event: round:countdown
 * Emitted every 1 second during OPEN phase (30 times)
 *
 * Backend source: EngineGateway.handleCountdown()
 */
export interface RoundCountdownEvent {
  roundId: string;
  roundNumber: string;
  status: 'OPEN';
  countdown: number; // 30, 29, 28, ..., 1
  serverTime: string;
}

/**
 * Event: round:drawing-started
 * Emitted when drawing phase begins
 *
 * Backend source: EngineGateway.handleDrawingStarted()
 */
export interface DrawingStartedEvent {
  roundId: string;
  roundNumber: string;
  status: 'DRAWING';
  isJackpot: boolean;
  serverTime: string;
  // jackpotOnRange NOT sent yet (only revealed at FINISHED)
}

/**
 * Event: round:drawing-ball
 * Emitted for each of the 20 balls drawn
 *
 * Backend source: EngineGateway.handleDrawingBall()
 * Backend timing:
 * - Emit ball
 * - Wait 1000ms (blue ball display)
 * - Emit delay
 * - Wait 1000ms (gray cycling)
 * - Repeat
 */
export interface DrawingBallEvent {
  roundId: string;
  roundNumber: string;
  status: 'DRAWING';
  ball: number; // 1-80
  position: number; // 1-20
  cumulativeSum: number; // running total
  serverTime: string;
}

/**
 * Event: round:drawing-delay
 * Emitted between ball announcements
 *
 * Backend source: EngineGateway.handleDrawingDelay()
 * Backend timing: Emitted AFTER ball, BEFORE next ball (1000ms gray cycling)
 */
export interface DrawingDelayEvent {
  roundId: string;
  roundNumber: string;
  status: 'DRAWING';
  processDelay: number; // Always 1 (indicator)
  serverTime: string;
}

/**
 * Event: round:finished
 * Emitted when all 20 balls are drawn, final results displayed
 *
 * Backend source: EngineGateway.handleRoundFinished()
 */
export interface RoundFinishedEvent {
  roundId: string;
  roundNumber: string;
  status: 'FINISHED';
  drawnNumbers: number[]; // All 20 balls
  sum: number; // Final sum
  drawnAt: string; // ISO timestamp
  ouResult: OverUnder;
  rangeResult: Range;
  isJackpot: boolean;
  jackpotOnRange: Range | null; // NOW revealed
  jackpotHit: boolean;
  serverTime: string;
}

/**
 * Event: round:settled
 * Emitted when round is settled and payouts complete
 *
 * Backend source: EngineGateway.handleRoundSettled()
 */
export interface RoundSettledEvent {
  roundId: string;
  roundNumber: string;
  status: 'SETTLED';
  serverTime: string;
}

// ============================================================================
// HTTP API RESPONSE (from game.query.ts)
// ============================================================================

/**
 * HTTP GET /api/v1/lotto/current response
 * Used for initial hydration and page refresh
 */
export interface CurrentRoundResponse {
  id: string;
  roundNumber: string;
  status: LottoStatus;
  drawnNumbers?: number[];
  sum?: number;
  ouResult?: OverUnder;
  rangeResult?: Range;
  isJackpot: boolean;
  jackpotOnRange?: Range;
  serverTime?: string;
  openedAt?: string;
  closedAt?: string;
  drawnAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// INTERNAL REDUCER EVENTS
// ============================================================================

/**
 * Hydration payload for initializing state from HTTP API
 */
export interface HydrateSnapshotPayload {
  roundId: string;
  roundNumber: string;
  phase: LottoPhase;
  serverTime?: Date | null;
  totalCountdownSeconds?: number | null;
  balls?: LottoBall[];
  currentSum?: number;
  finalSum?: number | null;
  ouResult?: OverUnder | null;
  rangeResult?: Range | null;
  isJackpot?: boolean;
  jackpotOnRange?: Range | null;
  jackpotHit?: boolean;
}

/**
 * Internal reducer events
 * These are dispatched to the reducer from various sources:
 * - WebSocket events (via LottoProvider)
 * - HTTP API hydration (via LottoProvider)
 * - Manual triggers (debugging/testing)
 */
export type LottoEvent =
  | { type: 'RESET' }
  | { type: 'HYDRATE_SNAPSHOT'; payload: HydrateSnapshotPayload }
  | {
      type: 'SET_PREVIOUS_ROUND';
      previousRound: {
        roundNumber: string;
        balls: LottoBall[];
        finalSum: number;
        ouResult: OverUnder;
        rangeResult: Range;
        isJackpot: boolean;
        jackpotOnRange: Range | null;
        jackpotHit: boolean;
      };
    }
  | {
      type: 'ROUND_OPENED';
      roundId: string;
      roundNumber: string;
      totalCountdownSeconds: number;
      serverTime: Date;
    }
  | {
      type: 'COUNTDOWN_TICK';
      roundId: string;
      secondsRemaining: number;
      serverTime: Date;
    }
  | {
      type: 'DRAWING_STARTED';
      roundId: string;
      roundNumber: string;
      isJackpot: boolean;
      serverTime: Date;
    }
  | {
      type: 'DRAWING_DELAY';
      roundId: string;
      serverTime: Date;
    }
  | {
      type: 'BALL_DRAWN';
      roundId: string;
      position: number;
      number: number;
      sumAfter: number;
      serverTime: Date;
    }
  | {
      type: 'ROUND_FINISHED';
      roundId: string;
      roundNumber: string;
      drawnNumbers: number[];
      finalSum: number;
      ouResult: OverUnder;
      rangeResult: Range;
      isJackpot: boolean;
      jackpotOnRange: Range | null;
      jackpotHit: boolean;
      serverTime: Date;
    }
  | {
      type: 'ROUND_SETTLED';
      roundId: string;
      serverTime: Date;
    };
