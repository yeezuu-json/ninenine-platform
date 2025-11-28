import { History, Trophy } from 'lucide-react';
import BallAnimation from './features/ball-animation';
import CountdownTimer from './features/countdown-timer';
import NumberGrid from './features/number-grid';
import OverUnderPanel from './features/over-under-panel';
import RangePanel from './features/range-panel';
import { useLottoGame } from '@ninenine/core-provider';

export default function GamePlay() {
  const { roundNumber, previousRound } = useLottoGame();
  const ouBadge =
    previousRound?.ouResult === 'UNDER'
      ? { label: 'U', className: 'text-blue-500' }
      : previousRound?.ouResult === 'OVER'
      ? { label: 'O', className: 'text-red-500' }
      : null;
  const rangeLabel =
    previousRound?.rangeResult === 'RANGE_1'
      ? '1'
      : previousRound?.rangeResult === 'RANGE_2'
      ? '2'
      : previousRound?.rangeResult === 'RANGE_3'
      ? '3'
      : previousRound?.rangeResult === 'RANGE_4'
      ? '4'
      : previousRound?.rangeResult === 'RANGE_5'
      ? '5'
      : null;

  return (
    <section className="flex gap-1">
      <div className="flex flex-col">
        <div className="min-h-16 border border-operator-border bg-operator-surface">
          <div className="h-full flex justify-between">
            <div className="flex items-center gap-2 min-w-0">{/* image */}</div>
            {previousRound ? (
              <div className="p-2 flex flex-col items-center justify-between text-xs leading-tight text-operator-text min-w-0 max-w-xs">
                <div className="flex items-center gap-1 min-w-0 text-operator-text">
                  <History className="size-3 text-operator-text" />
                  <div className="truncate">
                    Last round:{' '}
                    <span className="font-bold">
                      #{previousRound.roundNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-operator-text">
                    {previousRound.finalSum}
                  </span>
                  {ouBadge && (
                    <span
                      className={`text-xs font-semibold ${ouBadge.className}`}
                    >
                      {ouBadge.label}
                    </span>
                  )}
                  {rangeLabel && (
                    <span className="inline-flex items-center rounded-full border border-operator-border text-[9px] px-2 py-0.5 font-semibold text-operator-primary">
                      Range៖ {rangeLabel}
                    </span>
                  )}
                  {previousRound.jackpotHit && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-operator-border text-[9px] px-1.5 py-0.5 font-semibold text-operator-primary">
                      <Trophy className="size-2.5" />
                      Jackpot
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="p-2 text-xs text-operator-text">
                Previous round info unavailable
              </p>
            )}
          </div>
        </div>
        <div className="flex-1 mt-1 flex flex-col gap-1">
          <NumberGrid />
        </div>
      </div>
      <div className="flex-1 flex flex-col max-w-[360px] min-w-[360px]">
        <div className="h-full flex justify-between gap-0.5">
          <div className="max-w-24 flex flex-col">
            <CountdownTimer />
            <BallAnimation />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-2 min-h-16 border border-operator-border bg-operator-surface">
              <span className="text-operator-text">ROUND: </span>
              <span className="font-bold text-operator-primary">
                {roundNumber}
              </span>
            </div>
            <OverUnderPanel />
          </div>
        </div>
        <RangePanel />
      </div>
    </section>
  );
}
