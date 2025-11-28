import { motion } from 'motion/react';
import { useLottoGame } from '@ninenine/core-provider';
import { cn } from '@ninenine-platform/ui/lib/utils';
import { useBetModal } from '../../contexts/use-bet-modal';

export default function OverUnderPanel() {
  const { ouResult, isFinished, isSettled, isDrawing, roundId } =
    useLottoGame();
  const showResult = isFinished || isSettled;
  const { openBetModal } = useBetModal();

  // Can bet when not finished, not settled, and not currently drawing
  const canBet = !isFinished && !isSettled && !isDrawing && roundId;

  const handleClick = (option: string) => {
    console.log(
      'Click detected:',
      option,
      'canBet:',
      canBet,
      'roundId:',
      roundId
    );
    if (canBet) {
      openBetModal(option, roundId);
    }
  };

  return (
    <div className="flex-1 mt-1 grid grid-cols-2 divide-x-2 border border-operator-border">
      {/* UNDER */}
      <motion.div
        onClick={() => handleClick('UNDER')}
        animate={{
          opacity: showResult ? (ouResult === 'UNDER' ? 1 : 0.5) : 1,
          scale: showResult && ouResult === 'UNDER' ? 1.02 : 1,
        }}
        whileHover={canBet ? { scale: 1.007, opacity: 0.8 } : {}}
        whileTap={canBet ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        className={cn(
          'bg-blue-500 relative',
          showResult && ouResult === 'UNDER' && 'ring-4 ring-orange-400',
          canBet && 'cursor-pointer'
        )}
      >
        <div className="absolute bottom-0 w-full bg-blue-50 py-1 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-bold text-gray-900">210-810</span>
          <span className="text-xs font-semibold text-gray-900">1.95</span>
        </div>
        <div className="h-[calc(100%-2.5rem)] w-full flex items-center justify-center text-white text-2xl font-black pointer-events-none">
          UNDER
          {showResult && ouResult === 'UNDER' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 text-3xl"
            >
              ✓
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* OVER */}
      <motion.div
        onClick={() => handleClick('OVER')}
        animate={{
          opacity: showResult ? (ouResult === 'OVER' ? 1 : 0.5) : 1,
          scale: showResult && ouResult === 'OVER' ? 1.02 : 1,
        }}
        whileHover={canBet ? { scale: 1.007, opacity: 0.8 } : {}}
        whileTap={canBet ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        className={cn(
          'bg-red-500 relative',
          showResult && ouResult === 'OVER' && 'ring-4 ring-orange-400',
          canBet && 'cursor-pointer'
        )}
      >
        <div className="absolute bottom-0 w-full bg-red-50 py-1 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-bold text-gray-900">811-1410</span>
          <span className="text-xs font-semibold text-gray-900">1.95</span>
        </div>
        <div className="h-[calc(100%-2.5rem)] w-full flex items-center justify-center text-white text-2xl font-black pointer-events-none">
          OVER
          {showResult && ouResult === 'OVER' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 text-3xl"
            >
              ✓
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
