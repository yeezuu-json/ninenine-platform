import type {
  HydrateSnapshotPayload,
  CurrentRoundResponse,
  LottoPhase,
  LottoBall,
} from '../types/lotto80';

export function transformApiToSnapshot(
  apiData: CurrentRoundResponse
): HydrateSnapshotPayload {
  console.log('[transformApiToSnapshot] Unwrapped data:', apiData);

  // If no data, return initial state with empty strings
  if (!apiData || !apiData.id) {
    console.warn(
      '[transformApiToSnapshot] No valid data, returning initial state'
    );
    return {
      roundId: '',
      roundNumber: '',
      phase: 'IDLE',
      serverTime: null,
      balls: [],
      currentSum: 0,
      finalSum: null,
      ouResult: null,
      rangeResult: null,
      isJackpot: false,
      jackpotOnRange: null,
      jackpotHit: false,
    };
  }

  // Determine phase from status
  let phase: LottoPhase;
  switch (apiData.status) {
    case 'OPEN':
      phase = 'OPEN';
      break;
    case 'DRAWING':
      phase = 'DRAWING';
      break;
    case 'FINISHED':
      phase = 'FINISHED';
      break;
    case 'SETTLED':
      phase = 'SETTLED';
      break;
    case 'VOIDED':
      phase = 'IDLE';
      break;
    default:
      phase = 'IDLE';
  }

  // Convert drawnNumbers array to LottoBall array if available
  const balls: LottoBall[] = apiData.drawnNumbers
    ? apiData.drawnNumbers.map((num, idx) => ({
        position: idx + 1,
        number: num,
        sumAfter:
          apiData.drawnNumbers?.slice(0, idx + 1).reduce((a, b) => a + b, 0) ||
          0,
      }))
    : [];

  const snapshot: HydrateSnapshotPayload = {
    roundId: apiData.id,
    roundNumber: apiData.roundNumber,
    phase,
    serverTime: apiData.serverTime
      ? new Date(apiData.serverTime)
      : apiData.updatedAt
      ? new Date(apiData.updatedAt)
      : null,
    balls,
    currentSum: apiData.sum || 0,
    finalSum: apiData.sum || null,
    ouResult: apiData.ouResult || null,
    rangeResult: apiData.rangeResult || null,
    isJackpot: apiData.isJackpot || false,
    jackpotOnRange: apiData.jackpotOnRange || null,
    jackpotHit: false, // Not provided by API, will be updated by events
  };

  console.log('[transformApiToSnapshot] Output:', snapshot);

  return snapshot;
}
