import { motion } from 'motion/react';
import { useLottoGame } from '@ninenine/core-provider';

export default function BallAnimation() {
  const { balls, lastBall, isDrawing, isDelay, randomBall, currentSum } =
    useLottoGame();

  return (
    <div className="flex-1 mt-1 border border-operator-border bg-operator-surface">
      <div className="relative h-full">
        {/* Position indicator */}
        {isDrawing && balls.length > 0 && (
          <div className="absolute top-0 w-full bg-red-500 dark:bg-red-700 text-white text-center text-xs font-bold px-2 py-1">
            {balls.length}/20
          </div>
        )}

        {/* Ball display area */}
        <div className="h-[calc(100%-0.2rem)] mx-auto p-4 flex items-center justify-center">
          {!isDrawing ? (
            // Placeholder when not drawing - animated with 3D sphere effect
            <motion.div
              className="relative w-18 h-18"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-18 h-18 rounded-full shadow-xl flex items-center justify-center border-2 bg-operator-primary border-operator-primary/70 overflow-hidden">
                {/* Base pulsing glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/5"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.15, 0.05],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* 3D rotating light highlight */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 20%, transparent 50%)',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Secondary rotating shadow for depth */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 20%, transparent 50%)',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Edge glow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: '0 0 20px 2px rgba(96, 165, 250, 0.5)',
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <motion.span
                  className="relative z-10 text-3xl text-white"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ?
                </motion.span>
              </div>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Gray ball with cycling numbers during delay */}
              {isDelay && (
                <motion.div
                  key="cycling"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-18 h-18 rounded-full shadow-2xl flex items-center justify-center bg-linear-to-br from-gray-500 to-gray-800 border-2 border-gray-600"
                >
                  <div className="absolute inset-0 rounded-full bg-white/5" />
                  <span className="relative z-10 text-4xl font-bold text-gray-300 drop-shadow-lg">
                    {randomBall}
                  </span>
                </motion.div>
              )}

              {/* Blue ball with actual drawn number */}
              {!isDelay && lastBall !== null && (
                <motion.div
                  key={`ball-${lastBall.number}`}
                  initial={{ scale: 0.3, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'backOut' }}
                  className="relative"
                >
                  <div className="w-18 h-18 rounded-full shadow-2xl flex items-center justify-center bg-operator-primary">
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                    <span className="relative z-10 text-4xl font-bold text-white drop-shadow-lg">
                      {lastBall.number}
                    </span>
                  </div>

                  {/* Sparkle effect */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-operator-primary/30"
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Sum display */}
        {(isDrawing || currentSum > 0) && (
          <div className="absolute w-full bottom-0 bg-red-500 dark:bg-red-700 text-center text-white text-lg font-bold">
            {currentSum}
          </div>
        )}
      </div>
    </div>
  );
}
