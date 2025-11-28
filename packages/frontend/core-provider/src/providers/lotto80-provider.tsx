import { useEffect, useReducer, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  LottoContext,
  lottoReducer,
  initialLottoState,
} from '../contexts/lotto80-context';
import { CurrentRoundResponse, HydrateSnapshotPayload } from '../types/lotto80';
import { transformApiToSnapshot } from '../utils/lotto80';

interface LottoProviderProps {
  children: ReactNode;
  socketUrl: string;
  snapshotUrl: string;
}

/**
 * LottoProvider manages the WebSocket connection and HTTP API hydration
 * for the Lotto80 game. It dispatches events to the reducer and provides
 * the state to all consumer components via LottoContext.
 *
 * Features:
 * - HTTP API snapshot hydration on mount
 * - WebSocket connection management with auto-reconnect
 * - Event mapping from backend Socket.IO events to internal reducer events
 * - Round ID validation to ignore events from wrong rounds
 * - Re-fetch snapshot on reconnection to recover from disconnects
 */
export function Lotto80Provider({
  children,
  socketUrl,
  snapshotUrl,
}: LottoProviderProps) {
  const [state, dispatch] = useReducer(lottoReducer, initialLottoState);
  const socketRef = useRef<Socket | null>(null);
  const currentRoundIdRef = useRef<string | null>(null);

  // Update current round ID whenever state changes
  useEffect(() => {
    currentRoundIdRef.current = state.roundId;
  }, [state.roundId]);

  // HTTP API snapshot hydration on mount
  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const response = await fetch(snapshotUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const apiData = await response.json();

        console.log('[LottoProvider] Fetched snapshot:', apiData);

        // Transform CurrentRoundResponse to HydrateSnapshotPayload
        const payload: HydrateSnapshotPayload = transformApiToSnapshot(
          apiData as CurrentRoundResponse
        );

        // Dispatch HYDRATE_SNAPSHOT event to reducer
        dispatch({
          type: 'HYDRATE_SNAPSHOT',
          payload,
        });

        // Always fetch previous settled round (needed for displaying last results)
        // This handles page refresh during any phase (OPEN, DRAWING, FINISHED, etc.)
        try {
          const previousUrl = snapshotUrl.replace(
            '/current-round',
            '/previous-round'
          );
          const prevResponse = await fetch(previousUrl);
          console.log(
            '[LottoProvider] Previous round response status:',
            prevResponse.status
          );

          if (prevResponse.ok) {
            const prevData =
              (await prevResponse.json()) as CurrentRoundResponse;
            console.log('[LottoProvider] Previous round raw data:', prevData);

            if (prevData && prevData?.id) {
              const prevPayload = transformApiToSnapshot(prevData);
              console.log(
                '[LottoProvider] Transformed previous round:',
                prevPayload
              );

              // Only set if we have valid ball data
              if (prevPayload.balls && prevPayload.balls.length > 0) {
                dispatch({
                  type: 'SET_PREVIOUS_ROUND',
                  previousRound: {
                    roundNumber: prevPayload.roundNumber,
                    balls: prevPayload.balls,
                    finalSum: prevPayload.finalSum ?? 0,
                    ouResult: prevPayload.ouResult ?? 'OVER',
                    rangeResult: prevPayload.rangeResult ?? 'RANGE_1',
                    isJackpot: prevPayload.isJackpot || false,
                    jackpotOnRange: prevPayload.jackpotOnRange || null,
                    jackpotHit: prevPayload.jackpotHit || false,
                  },
                });
                console.log(
                  '[LottoProvider] Previous round SET_PREVIOUS_ROUND dispatched'
                );
              } else {
                console.warn(
                  '[LottoProvider] Previous round has no balls, skipping'
                );
              }
            } else {
              console.warn(
                '[LottoProvider] Previous round response has no data'
              );
            }
          }
        } catch (error) {
          console.warn(
            '[LottoProvider] Failed to fetch previous round:',
            error
          );
          // Non-critical - continue without previous round
        }
      } catch (error) {
        console.error('[LottoProvider] Failed to fetch snapshot:', error);
        // Don't throw - allow app to continue with empty state
      }
    };

    fetchSnapshot();
  }, [snapshotUrl]);

  // WebSocket connection management
  useEffect(() => {
    console.log('[LottoProvider] Connecting to WebSocket:', socketUrl);

    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[LottoProvider] WebSocket connected');
      // Auto-subscribe to all Lotto80 events
      socket.emit('lotto80:subscribe');
      console.log('[LottoProvider] Subscribed to lotto80 events');
    });

    socket.on('disconnect', (reason) => {
      console.log('[LottoProvider] WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[LottoProvider] WebSocket connection error:', error);
    });

    // Map backend Socket.IO events to internal reducer events
    // Backend emits: round:opened, round:countdown, round:drawing-started, etc.
    // Internal reducer expects: ROUND_OPENED, COUNTDOWN_TICK, DRAWING_STARTED, etc.

    socket.on(
      'lotto80:round:opened',
      (data: {
        roundId: string;
        roundNumber: string;
        openDurationSeconds: number;
        serverTime: string;
      }) => {
        console.log('[LottoProvider] round:opened', data);
        dispatch({
          type: 'ROUND_OPENED',
          roundId: data.roundId,
          roundNumber: data.roundNumber,
          totalCountdownSeconds: data.openDurationSeconds,
          serverTime: new Date(data.serverTime),
        });
      }
    );

    socket.on(
      'lotto80:countdown',
      (data: { roundId: string; countdown: number; serverTime: string }) => {
        // Only dispatch if it's for the current round
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'COUNTDOWN_TICK',
            roundId: data.roundId,
            secondsRemaining: data.countdown,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    socket.on(
      'lotto80:drawing:started',
      (data: {
        roundId: string;
        roundNumber: string;
        isJackpot: boolean;
        serverTime: string;
      }) => {
        console.log('[LottoProvider] round:drawing-started', data);
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'DRAWING_STARTED',
            roundId: data.roundId,
            roundNumber: data.roundNumber,
            isJackpot: data.isJackpot,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    socket.on(
      'lotto80:drawing:delay',
      (data: { roundId: string; serverTime: string }) => {
        // This event triggers gray cycling animation in consumer hook
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'DRAWING_DELAY',
            roundId: data.roundId,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    socket.on(
      'lotto80:drawing:ball',
      (data: {
        roundId: string;
        ball: number;
        position: number;
        cumulativeSum: number;
        serverTime: string;
      }) => {
        console.log('[LottoProvider] round:drawing-ball', data);
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'BALL_DRAWN',
            roundId: data.roundId,
            position: data.position,
            number: data.ball,
            sumAfter: data.cumulativeSum,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    socket.on(
      'lotto80:round:finished',
      (data: {
        roundId: string;
        roundNumber: string;
        drawnNumbers: number[];
        sum: number;
        ouResult: string;
        rangeResult: string;
        isJackpot: boolean;
        jackpotOnRange: string | null;
        jackpotHit: boolean;
        serverTime: string;
      }) => {
        console.log('[LottoProvider] round:finished', data);
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'ROUND_FINISHED',
            roundId: data.roundId,
            roundNumber: data.roundNumber,
            drawnNumbers: data.drawnNumbers,
            finalSum: data.sum,
            ouResult: data.ouResult as 'OVER' | 'UNDER',
            rangeResult: data.rangeResult as
              | 'RANGE_1'
              | 'RANGE_2'
              | 'RANGE_3'
              | 'RANGE_4'
              | 'RANGE_5',
            isJackpot: data.isJackpot,
            jackpotOnRange: data.jackpotOnRange
              ? (data.jackpotOnRange as
                  | 'RANGE_1'
                  | 'RANGE_2'
                  | 'RANGE_3'
                  | 'RANGE_4'
                  | 'RANGE_5')
              : null,
            jackpotHit: data.jackpotHit,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    socket.on(
      'lotto80:round:settled',
      (data: { roundId: string; serverTime: string }) => {
        console.log('[LottoProvider] round:settled', data);
        if (data.roundId === currentRoundIdRef.current) {
          dispatch({
            type: 'ROUND_SETTLED',
            roundId: data.roundId,
            serverTime: new Date(data.serverTime),
          });
        }
      }
    );

    // Cleanup on unmount
    return () => {
      console.log('[LottoProvider] Disconnecting WebSocket');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('lotto80:round:opened');
      socket.off('lotto80:countdown');
      socket.off('lotto80:drawing:started');
      socket.off('lotto80:drawing:delay');
      socket.off('lotto80:drawing:ball');
      socket.off('lotto80:round:finished');
      socket.off('lotto80:round:settled');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl, snapshotUrl]);

  return (
    <LottoContext.Provider value={{ state, dispatch }}>
      {children}
    </LottoContext.Provider>
  );
}
