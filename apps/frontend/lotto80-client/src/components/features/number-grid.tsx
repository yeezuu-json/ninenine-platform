import { motion } from 'motion/react';
import { useLottoGame, useOperatorTheme } from '@ninenine/core-provider';

export default function NumberGrid() {
  const { balls, phase, previousRound } = useLottoGame();
  const { theme } = useOperatorTheme();
  const allNumbers = Array.from({ length: 80 }, (_, i) => i + 1);

  // During OPEN/COUNTDOWN phase, show previous round's balls
  // During DRAWING/FINISHED/SETTLED, show current round's balls
  const displayBalls =
    (phase === 'OPEN' || phase === 'COUNTDOWN') && previousRound
      ? previousRound.balls
      : balls;
  const drawnNumbers = new Set(displayBalls.map((b) => b.number));

  return (
    <div className="inline-block">
      <div className="grid grid-cols-10">
        {allNumbers.map((num) => {
          const isDrawn = drawnNumbers.has(num);
          return (
            <motion.div
              key={num}
              initial={false}
              animate={{
                backgroundColor: isDrawn
                  ? theme?.colors.primary || 'var(--operator-primary)'
                  : 'var(--operator-surface)',
                color: isDrawn ? 'rgb(255, 255, 255)' : 'var(--operator-text)',
                boxShadow: isDrawn
                  ? `0 0 2px ${
                      theme?.colors.primary || 'var(--operator-primary)'
                    }`
                  : 'none',
                scale: isDrawn ? [1, 1.15, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                scale: {
                  duration: 0.4,
                  times: [0, 0.5, 1],
                  ease: 'easeOut',
                },
              }}
              className="size-9 aspect-square flex items-center justify-center border border-operator-border -mr-px -mb-px"
            >
              <span className="text-[14px] font-semibold">{num}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
