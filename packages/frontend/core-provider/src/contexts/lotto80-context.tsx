/**
 * Lotto Context
 *
 * Provides React Context for Lotto game state management
 * Contains reducer logic for state updates based on events
 */

import { createContext } from 'react';
import type { LottoGameState, LottoEvent, LottoBall } from '../types/lotto80';

// ============================================================================
// INITIAL STATE
// ============================================================================

export const initialLottoState: LottoGameState = {
  roundId: null,
  roundNumber: null,
  phase: 'IDLE',
  serverTime: null,
  secondsRemaining: null,
  totalCountdownSeconds: null,
  balls: [],
  currentSum: 0,
  showingDelay: false,
  finalSum: null,
  ouResult: null,
  rangeResult: null,
  isJackpot: false,
  jackpotOnRange: null,
  jackpotHit: false,
  previousRound: null,
};

// ============================================================================
// REDUCER
// ============================================================================

/**
 * Lotto game state reducer
 * Handles all state transitions based on events from WebSocket and HTTP API
 *
 * Event flow:
 * 1. HYDRATE_SNAPSHOT (on mount/refresh) -> any phase
 * 2. ROUND_OPENED -> OPEN phase
 * 3. COUNTDOWN_TICK (30 times) -> COUNTDOWN phase
 * 4. DRAWING_STARTED -> DRAWING phase
 * 5. BALL_DRAWN (20 times) + DRAWING_DELAY (19 times) -> stay DRAWING
 * 6. ROUND_FINISHED -> FINISHED phase
 * 7. ROUND_SETTLED -> SETTLED phase
 * 8. RESET -> IDLE phase
 */
export function lottoReducer(
  state: LottoGameState,
  event: LottoEvent
): LottoGameState {
  switch (event.type) {
    case 'RESET':
      return initialLottoState;

    case 'HYDRATE_SNAPSHOT': {
      // Initialize state from HTTP API (on mount or refresh)
      const {
        roundId,
        roundNumber,
        phase,
        serverTime = null,
        balls = [],
        currentSum = 0,
        finalSum = null,
        ouResult = null,
        rangeResult = null,
        isJackpot = false,
        jackpotOnRange = null,
        jackpotHit = false,
      } = event.payload;

      const totalCountdownSeconds = event.payload.totalCountdownSeconds ?? 150;

      return {
        roundId,
        roundNumber,
        phase,
        secondsRemaining: null,
        // Use value from snapshot if available, otherwise default to 150 (backend's OPEN_DURATION)
        totalCountdownSeconds,
        serverTime,
        balls,
        currentSum,
        showingDelay: false,
        finalSum,
        ouResult,
        rangeResult,
        isJackpot,
        jackpotOnRange,
        jackpotHit,
        previousRound: state.previousRound, // Preserve existing previousRound
      };
    }

    case 'ROUND_OPENED': {
      // Save current round as previous round before clearing
      const previousRound =
        (state.phase === 'SETTLED' || state.phase === 'FINISHED') &&
        state.balls.length > 0 &&
        state.finalSum !== null &&
        state.roundNumber !== null
          ? {
              roundNumber: state.roundNumber,
              balls: state.balls,
              finalSum: state.finalSum,
              ouResult: state.ouResult ?? 'OVER',
              rangeResult: state.rangeResult ?? 'RANGE_3',
              isJackpot: state.isJackpot,
              jackpotOnRange: state.jackpotOnRange,
              jackpotHit: state.jackpotHit,
            }
          : state.previousRound; // Keep existing previousRound if current round isn't complete

      // New round starts, reset current round but keep previousRound
      return {
        roundId: event.roundId,
        roundNumber: event.roundNumber,
        phase: 'OPEN',
        serverTime: event.serverTime,
        secondsRemaining: null,
        totalCountdownSeconds: event.totalCountdownSeconds,
        balls: [],
        currentSum: 0,
        showingDelay: false,
        finalSum: null,
        ouResult: null,
        rangeResult: null,
        isJackpot: false,
        jackpotOnRange: null,
        jackpotHit: false,
        previousRound, // Keep previous round for display during countdown
      };
    }

    case 'COUNTDOWN_TICK': {
      // Ignore if wrong round
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      return {
        ...state,
        phase: 'COUNTDOWN',
        serverTime: event.serverTime,
        secondsRemaining: event.secondsRemaining,
        // Preserve totalCountdownSeconds from state via spread operator
      };
    }

    case 'DRAWING_STARTED': {
      // Ignore if wrong round
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      return {
        ...state,
        roundId: event.roundId,
        roundNumber: event.roundNumber,
        phase: 'DRAWING',
        serverTime: event.serverTime,
        balls: [],
        currentSum: 0,
        showingDelay: false,
        isJackpot: event.isJackpot,
      };
    }

    case 'DRAWING_DELAY': {
      // Set showingDelay true to trigger gray cycling animation
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      return {
        ...state,
        serverTime: event.serverTime,
        showingDelay: true,
      };
    }

    case 'BALL_DRAWN': {
      // Ignore if wrong round
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      const newBall: LottoBall = {
        position: event.position,
        number: event.number,
        sumAfter: event.sumAfter,
      };

      return {
        ...state,
        phase: 'DRAWING',
        balls: [...state.balls, newBall],
        currentSum: event.sumAfter,
        serverTime: event.serverTime,
        showingDelay: false, // Show blue ball when drawn
      };
    }

    case 'ROUND_FINISHED': {
      // Ignore if wrong round
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      // Convert array of numbers to LottoBall array
      const balls: LottoBall[] = event.drawnNumbers.map((num, idx) => ({
        position: idx + 1,
        number: num,
        sumAfter: event.drawnNumbers
          .slice(0, idx + 1)
          .reduce((a, b) => a + b, 0),
      }));

      return {
        ...state,
        roundId: event.roundId,
        roundNumber: event.roundNumber,
        phase: 'FINISHED',
        balls,
        currentSum: event.finalSum,
        finalSum: event.finalSum,
        ouResult: event.ouResult,
        rangeResult: event.rangeResult,
        isJackpot: event.isJackpot,
        jackpotOnRange: event.jackpotOnRange,
        jackpotHit: event.jackpotHit,
        serverTime: event.serverTime,
      };
    }

    case 'ROUND_SETTLED': {
      // Ignore if wrong round
      if (state.roundId && state.roundId !== event.roundId) {
        return state;
      }

      return {
        ...state,
        phase: 'SETTLED',
        serverTime: event.serverTime,
      };
    }

    case 'SET_PREVIOUS_ROUND': {
      // Set previous round data from HTTP API
      console.log(
        '[lottoReducer] SET_PREVIOUS_ROUND received:',
        event.previousRound
      );
      const newState = {
        ...state,
        previousRound: event.previousRound,
      };
      console.log(
        '[lottoReducer] New state previousRound:',
        newState.previousRound
      );
      return newState;
    }

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

export interface LottoContextValue {
  state: LottoGameState;
  dispatch: (event: LottoEvent) => void;
}

export const LottoContext = createContext<LottoContextValue | null>(null);
