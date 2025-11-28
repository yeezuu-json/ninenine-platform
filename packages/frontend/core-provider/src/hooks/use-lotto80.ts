import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LottoContext } from '../contexts/lotto80-context';

/**
 * useLottoGame Hook
 *
 * Consumer hook that provides a clean API for components to access
 * the Lotto80 game state with derived values and animation state.
 *
 * Features:
 * - Access to complete game state from LottoContext
 * - Derived state (isIdle, isDrawing, lastBall, phaseLabel)
 * - RAF-based cycling animation for gray ball (randomBall, isDelay)
 * - Type-safe context access with error handling
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { phase, balls, currentSum, randomBall, isDelay } = useLottoGame();
 *   // ...
 * }
 * ```
 */
export function useLottoGame() {
  const context = useContext(LottoContext);

  if (!context) {
    throw new Error('useLottoGame must be used within a LottoProvider');
  }

  const { state, dispatch } = context;

  // ============================================================================
  // RAF ANIMATION STATE (cycling numbers during DRAWING phase)
  // ============================================================================

  const [randomBall, setRandomBall] = useState<number>(1);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Animation effect: RAF loop for cycling numbers (1-80) during DRAWING phase
  useEffect(() => {
    const UPDATE_INTERVAL = 50; // Update randomBall every 50ms

    function animate(timestamp: number) {
      // Update randomBall every 50ms
      if (timestamp - lastUpdateRef.current >= UPDATE_INTERVAL) {
        setRandomBall(Math.floor(Math.random() * 80) + 1);
        lastUpdateRef.current = timestamp;
      }

      // Continue animation during DRAWING phase
      if (state.phase === 'DRAWING') {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    }

    // Start RAF loop when entering DRAWING phase
    if (state.phase === 'DRAWING') {
      rafIdRef.current = requestAnimationFrame(animate);
    }

    // Cleanup on unmount or phase change
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [state.phase]);

  // Use showingDelay flag from state
  // This is managed by the reducer:
  // - BALL_DRAWN event sets showingDelay = false (show blue ball)
  // - DRAWING_DELAY event sets showingDelay = true (show gray cycling)
  const isDelay = state.showingDelay;

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isIdle = state.phase === 'IDLE';
  const isOpen = state.phase === 'OPEN';
  const isCountdown = state.phase === 'COUNTDOWN';
  const isDrawing = state.phase === 'DRAWING';
  const isFinished = state.phase === 'FINISHED';
  const isSettled = state.phase === 'SETTLED';

  const lastBall = useMemo(() => {
    if (state.balls.length === 0) return null;
    return state.balls[state.balls.length - 1];
  }, [state.balls]);

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case 'IDLE':
        return 'Waiting...';
      case 'OPEN':
        return 'Open for Betting';
      case 'COUNTDOWN':
        return 'Countdown';
      case 'DRAWING':
        return 'Drawing...';
      case 'FINISHED':
        return 'Results';
      case 'SETTLED':
        return 'Settled';
      default:
        return 'Unknown';
    }
  }, [state.phase]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Raw state
    roundId: state.roundId,
    roundNumber: state.roundNumber,
    phase: state.phase,
    secondsRemaining: state.secondsRemaining,
    totalCountdownSeconds: state.totalCountdownSeconds,
    serverTime: state.serverTime,
    balls: state.balls,
    currentSum: state.currentSum,
    finalSum: state.finalSum,
    ouResult: state.ouResult,
    rangeResult: state.rangeResult,
    isJackpot: state.isJackpot,
    jackpotOnRange: state.jackpotOnRange,
    jackpotHit: state.jackpotHit,
    previousRound: state.previousRound,

    // Derived state
    isIdle,
    isOpen,
    isCountdown,
    isDrawing,
    isFinished,
    isSettled,
    lastBall,
    phaseLabel,

    // Animation state
    randomBall,
    isDelay,

    // Dispatch (for manual actions if needed)
    dispatch,
  };
}
