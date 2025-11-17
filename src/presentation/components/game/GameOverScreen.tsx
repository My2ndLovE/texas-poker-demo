import { useGameStore } from '@/state-management/gameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Frown, RotateCcw, Settings } from 'lucide-react';

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const reset = useGameStore((state) => state.reset);

  if (!gameState || gameState.phase !== 'game-over') {
    return null;
  }

  // Determine if player won or lost
  const humanPlayer = gameState.players.find((p) => p.type === 'human');
  const playersWithChips = gameState.players.filter((p) => p.chips > 0);
  const isVictory = humanPlayer && humanPlayer.chips > 0 && playersWithChips.length === 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`bg-gradient-to-br ${
            isVictory
              ? 'from-yellow-600 to-yellow-800 border-yellow-400'
              : 'from-gray-700 to-gray-900 border-gray-500'
          } p-12 rounded-3xl shadow-2xl border-4 max-w-2xl text-center`}
          initial={{ scale: 0, rotateZ: -10 }}
          animate={{ scale: 1, rotateZ: 0 }}
          exit={{ scale: 0, rotateZ: 10 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          {/* Icon */}
          <motion.div
            className="mb-8"
            animate={
              isVictory
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }
                : {
                    scale: [1, 1.1, 1],
                  }
            }
            transition={{ duration: 0.8, repeat: 2 }}
          >
            {isVictory ? (
              <Award className="w-32 h-32 mx-auto text-yellow-200" />
            ) : (
              <Frown className="w-32 h-32 mx-auto text-gray-400" />
            )}
          </motion.div>

          {/* Title */}
          <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-wider">
            {isVictory ? 'Victory!' : 'Game Over'}
          </h1>

          {/* Message */}
          <p className="text-2xl text-white mb-4">
            {isVictory
              ? 'Congratulations! You defeated all opponents!'
              : 'You ran out of chips. Better luck next time!'}
          </p>

          {/* Stats */}
          {humanPlayer && (
            <div className="bg-black/30 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-6 text-white">
                <div>
                  <p className="text-sm text-gray-300 uppercase">Final Chips</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    ${humanPlayer.chips.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase">Hands Played</p>
                  <p className="text-3xl font-bold text-blue-400">{gameState.handNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => {
                reset();
                // Refresh the page to restart
                window.location.reload();
              }}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <RotateCcw className="w-6 h-6" />
              Play Again
            </button>

            <button
              type="button"
              onClick={() => alert('Settings feature coming soon!')}
              className="flex items-center gap-3 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <Settings className="w-6 h-6" />
              Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
