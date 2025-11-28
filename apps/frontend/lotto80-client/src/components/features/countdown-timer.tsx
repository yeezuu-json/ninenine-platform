import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@ninenine-platform/ui/lib/utils';
import { useLottoGame } from '@ninenine/core-provider';

export default function CountdownTimer() {
  const { isCountdown, isOpen, secondsRemaining, totalCountdownSeconds } =
    useLottoGame();

  const isVisible =
    (isOpen || isCountdown) &&
    secondsRemaining !== null &&
    secondsRemaining > 0;

  const isUrgent = (secondsRemaining ?? 0) <= 5;

  // Calculate progress percentage using actual max from backend
  const maxSeconds = totalCountdownSeconds ?? 150;
  const progress = secondsRemaining ? (secondsRemaining / maxSeconds) * 100 : 0;

  // Circle properties - much smaller size
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-16 flex items-center justify-between border border-operator-border bg-operator-surface">
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Circular progress ring with countdown number */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <motion.circle
                  key={`progress-${secondsRemaining}`}
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  className={cn(
                    isUrgent ? 'text-red-500' : 'text-operator-primary'
                  )}
                  initial={false}
                  animate={{
                    strokeDashoffset: strokeDashoffset,
                  }}
                  transition={{ duration: 0.8, ease: 'linear' }}
                />
              </svg>

              {/* Countdown number */}
              <motion.div
                key={secondsRemaining}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                <motion.div
                  animate={
                    isUrgent
                      ? {
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className={cn(
                    'text-[14px] font-black tabular-nums',
                    isUrgent ? 'text-red-500' : 'text-primary'
                  )}
                >
                  {secondsRemaining}
                </motion.div>
              </motion.div>

              {/* Ripple effect on each second */}
              <motion.div
                key={`ripple-${secondsRemaining}`}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={cn(
                  'absolute inset-0 rounded-full border-2',
                  isUrgent ? 'border-red-500' : 'border-operator-primary'
                )}
              />

              {/* Pulsing glow for urgent state */}
              {isUrgent && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-full bg-red-500 blur-xl"
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="mx-auto text-xs text-muted-foreground font-semibold"
          >
            <motion.span
              animate={{
                rotate: [0, 360, 360, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                times: [0, 0.3, 0.7, 1],
                ease: 'easeInOut',
              }}
              className="inline-block"
            >
              <span role="img" aria-label="dice">
                🎲
              </span>
            </motion.span>{' '}
            Drawing
            <motion.span
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.2,
              }}
            >
              ...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
