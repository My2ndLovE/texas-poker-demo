import { useState } from 'react';
import { useGameStore } from '@/state-management/gameStore';
import { bettingRules } from '@/game-logic/rules/BettingRules';
import { motion } from 'framer-motion';

export function ActionButtons() {
  const gameState = useGameStore((state) => state.gameState);
  const processPlayerAction = useGameStore((state) => state.processPlayerAction);
  const isProcessing = useGameStore((state) => state.isProcessingAction);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [showRaiseInput, setShowRaiseInput] = useState(false);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Only show buttons for human player
  if (!currentPlayer || currentPlayer.type !== 'human') {
    return null;
  }

  const validActions = bettingRules.getValidActions(currentPlayer, gameState);
  const callAmount = bettingRules.getCallAmount(currentPlayer, gameState);
  const minRaise = bettingRules.getMinimumRaise(gameState);

  const handleAction = (action: string) => {
    if (action === 'raise' && !showRaiseInput) {
      setRaiseAmount(minRaise);
      setShowRaiseInput(true);
      return;
    }

    if (action === 'raise' && showRaiseInput) {
      processPlayerAction(currentPlayer.id, 'raise', raiseAmount);
      setShowRaiseInput(false);
      return;
    }

    processPlayerAction(currentPlayer.id, action as any, callAmount);
    setShowRaiseInput(false);
  };

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800/95 p-6 rounded-2xl shadow-2xl border-2 border-gray-700"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4 items-center">
        {/* Fold Button */}
        {validActions.includes('fold') && (
          <button
            onClick={() => handleAction('fold')}
            disabled={isProcessing}
            className="action-button bg-red-600 hover:bg-red-700 text-white"
          >
            Fold
          </button>
        )}

        {/* Check Button */}
        {validActions.includes('check') && (
          <button
            onClick={() => handleAction('check')}
            disabled={isProcessing}
            className="action-button bg-blue-600 hover:bg-blue-700 text-white"
          >
            Check
          </button>
        )}

        {/* Call Button */}
        {validActions.includes('call') && (
          <button
            onClick={() => handleAction('call')}
            disabled={isProcessing}
            className="action-button bg-green-600 hover:bg-green-700 text-white"
          >
            Call ${callAmount}
          </button>
        )}

        {/* Bet Button */}
        {validActions.includes('bet') && (
          <button
            onClick={() => handleAction('raise')}
            disabled={isProcessing}
            className="action-button bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Bet
          </button>
        )}

        {/* Raise Button */}
        {validActions.includes('raise') && (
          <div className="flex gap-2 items-center">
            {showRaiseInput ? (
              <>
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  min={minRaise}
                  max={currentPlayer.chips}
                  className="w-24 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                />
                <button
                  onClick={() => handleAction('raise')}
                  disabled={isProcessing || raiseAmount < minRaise}
                  className="action-button bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Raise
                </button>
                <button
                  onClick={() => setShowRaiseInput(false)}
                  className="action-button bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => handleAction('raise')}
                disabled={isProcessing}
                className="action-button bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Raise
              </button>
            )}
          </div>
        )}

        {/* All-In Button */}
        {validActions.includes('all-in') && (
          <button
            onClick={() => handleAction('all-in')}
            disabled={isProcessing}
            className="action-button bg-purple-600 hover:bg-purple-700 text-white"
          >
            All-In (${currentPlayer.chips})
          </button>
        )}
      </div>

      {showRaiseInput && (
        <div className="mt-2 text-sm text-gray-400">
          Min raise: ${minRaise} | Max: ${currentPlayer.chips}
        </div>
      )}
    </motion.div>
  );
}
