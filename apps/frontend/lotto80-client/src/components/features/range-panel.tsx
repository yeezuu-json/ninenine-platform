import { motion } from 'motion/react';
import { useLottoGame } from '@ninenine/core-provider';
import { cn } from '@ninenine-platform/ui/lib/utils';
import { useBetModal } from '../../contexts/use-bet-modal';

export default function RangePanel() {
  const {
    rangeResult,
    isFinished,
    isSettled,
    isJackpot,
    jackpotOnRange,
    jackpotHit,
    isDrawing,
    roundId,
  } = useLottoGame();
  const showResult = isFinished || isSettled;
  const { openBetModal } = useBetModal();

  // Can bet when not finished, not settled, and not currently drawing
  const canBet = !isFinished && !isSettled && !isDrawing && roundId;

  const handleRangeClick = (rangeKey: string) => {
    if (canBet) {
      openBetModal(`RANGE ${rangeKey}`, roundId);
    }
  };

  // Mystery Jackpot Mode: Only show jackpotOnRange when FINISHED/SETTLED
  const showJackpotRange = showResult && jackpotOnRange !== null;

  const ranges = [
    { key: '1', label: '210-695', odd: '9.2' },
    { key: '2', label: '696-763', odd: '4.6' },
    { key: '3', label: '764-856', odd: '2.3' },
    { key: '4', label: '857-923', odd: '4.6' },
    { key: '5', label: '924-1410', odd: '9.2' },
  ];

  return (
    <div className="flex flex-col border border-operator-border divide-y divide-operator-border bg-operator-surface mt-1">
      <div className="w-full text-center font-bold py-1 relative overflow-hidden text-operator-text">
        <span className="relative z-10">RANGE</span>
        {/* Mystery Jackpot indicator - shows during OPEN/DRAWING */}
        {isJackpot && !showJackpotRange && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 ml-2 text-yellow-400"
          >
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span role="img" aria-label="slot machine">
                🎰
              </span>{' '}
              JACKPOT ROUND
            </motion.span>
          </motion.span>
        )}
        {/* Revealed jackpot - shows at FINISHED/SETTLED */}
        {isJackpot && showJackpotRange && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative z-10 ml-2 text-yellow-400 font-extrabold"
          >
            🎉 JACKPOT! x2
          </motion.span>
        )}
        {/* Pulse background for mystery jackpot */}
        {isJackpot && !showJackpotRange && (
          <motion.div
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-yellow-400 z-0"
          />
        )}
      </div>
      <div className="grid grid-cols-5">
        {ranges.map((range) => {
          const isWinning = showResult && rangeResult === `RANGE_${range.key}`;
          // Only show jackpot overlay when range is revealed (FINISHED/SETTLED)
          const isJackpotRange =
            showJackpotRange && jackpotOnRange === `RANGE_${range.key}`;
          const isJackpotWin = isJackpotRange && jackpotHit;

          // Determine background color
          const getBgColor = () => {
            if (isJackpotWin) return undefined; // Use className
            if (isWinning) return 'var(--operator-accent)';
            return 'var(--operator-accent)';
          };

          return (
            <motion.div
              key={range.key}
              onClick={() => handleRangeClick(range.key)}
              animate={{
                opacity: showResult ? (isWinning ? 1 : 0.5) : 1,
                backgroundColor: getBgColor(),
              }}
              whileHover={
                canBet
                  ? {
                      backgroundColor: isJackpotWin
                        ? 'rgb(202, 138, 4)' // yellow-600
                        : 'var(--operator-primary)',
                    }
                  : {}
              }
              whileTap={canBet ? { scale: 0.95 } : {}}
              transition={{ duration: 0.2 }}
              style={{
                borderRight: '1px solid var(--border)',
              }}
              className={cn(
                'w-full min-h-24 flex flex-col items-center justify-center text-xs font-semibold relative overflow-hidden group last:border-r-0',
                // Base cursor
                canBet && 'cursor-pointer',
                // Jackpot win state
                isJackpotWin && 'ring-4 ring-orange-400'
              )}
            >
              {/* Jackpot overlay - explosive reveal animation */}
              {isJackpotWin && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    bounce: 0.6,
                    duration: 0.8,
                  }}
                  className="absolute inset-0 bg-linear-to-br from-yellow-400/40 via-yellow-500/30 to-orange-400/40 backdrop-blur-[1px]"
                >
                  {/* Pulse effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl"
                  />
                  {/* Rotating sparkle */}
                  {/* <motion.div
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute w-full top-2 flex items-center justify-center text-4xl"
                  >
                    ✨
                  </motion.div> */}
                  {/* Confetti burst effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="absolute w-full top-2 flex items-center justify-center text-5xl font-extrabold text-yellow-300"
                  >
                    <span role="img" aria-label="explosion">
                      💥
                    </span>
                  </motion.div>
                </motion.div>
              )}

              <div className="relative z-10 flex-1 flex items-center justify-center text-4xl font-bold">
                <span className="font-black bg-linear-to-br from-yellow-300 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-md drop-shadow-amber-950/15">
                  {range.key}
                </span>
                {/* {isWinning && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="absolute text-5xl text-amber-500"
                  >
                    {isJackpotWin ? "x2" : "✓"}
                  </motion.div>
                )} */}
              </div>
              <div
                className={cn(
                  'relative bottom-0 w-full text-center py-0.5 z-10 bg-yellow-100/40 dark:bg-yellow-100/20 text-foreground flex flex-col transition-colors duration-350',
                  canBet && 'group-hover:bg-yellow-100/80'
                )}
              >
                <span className="text-xs font-bold">{range.label}</span>
                <span className="text-xs font-semibold">{range.odd}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
