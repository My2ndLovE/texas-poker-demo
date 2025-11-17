import { bettingRules } from '@/game-logic/rules/BettingRules';
import { useGameStore } from '@/state-management/gameStore';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function ActionButtons() {
  const gameState = useGameStore((state) => state.gameState);
  const processPlayerAction = useGameStore((state) => state.processPlayerAction);
  const isProcessing = useGameStore((state) => state.isProcessingAction);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [showRaiseInput, setShowRaiseInput] = useState(false);
  const [showBetInput, setShowBetInput] = useState(false);
  const [betAmount, setBetAmount] = useState(0);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Only show buttons for human player
  if (!currentPlayer || currentPlayer.type !== 'human') {
    return null;
  }

  const validActions = bettingRules.getValidActions(currentPlayer, gameState);
  const callAmount = bettingRules.getCallAmount(currentPlayer, gameState);
  const minRaise = bettingRules.getMinimumRaise(gameState);
  const minBet = gameState.bigBlindAmount;

  const handleAction = (action: string, amount?: number) => {
    // Handle bet action
    if (action === 'bet' && !showBetInput) {
      setBetAmount(minBet);
      setShowBetInput(true);
      return;
    }

    if (action === 'bet' && showBetInput) {
      // Validate bet amount
      if (!Number.isFinite(betAmount) || betAmount < minBet) {
        alert(`Bet must be at least $${minBet}`);
        return;
      }
      if (betAmount > currentPlayer.chips) {
        alert(`Bet cannot exceed your chips ($${currentPlayer.chips})`);
        return;
      }
      processPlayerAction(currentPlayer.id, 'bet', betAmount);
      setShowBetInput(false);
      return;
    }

    // Handle raise action
    if (action === 'raise' && !showRaiseInput) {
      setRaiseAmount(minRaise);
      setShowRaiseInput(true);
      return;
    }

    if (action === 'raise' && showRaiseInput) {
      // Validate raise amount
      if (!Number.isFinite(raiseAmount) || raiseAmount < minRaise) {
        alert(`Raise must be at least $${minRaise}`);
        return;
      }
      // CRITICAL FIX: For raise, we need to pass call amount + raise amount
      const totalAmount = callAmount + raiseAmount;
      if (totalAmount > currentPlayer.chips) {
        alert(`Total amount ($${totalAmount}) exceeds your chips ($${currentPlayer.chips})`);
        return;
      }
      processPlayerAction(currentPlayer.id, 'raise', totalAmount);
      setShowRaiseInput(false);
      return;
    }

    // For other actions (fold, check, call, all-in)
    const finalAmount = amount ?? 0;
    if (!Number.isFinite(finalAmount) || finalAmount < 0) {
      console.error('Invalid amount for action:', action, finalAmount);
      return;
    }
    processPlayerAction(currentPlayer.id, action as any, finalAmount);
    setShowRaiseInput(false);
    setShowBetInput(false);
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
            onClick={() => handleAction('call', callAmount)}
            disabled={isProcessing}
            className="action-button bg-green-600 hover:bg-green-700 text-white"
          >
            Call ${callAmount}
          </button>
        )}

        {/* Bet Button */}
        {validActions.includes('bet') && (
          <div className="flex gap-2 items-center">
            {showBetInput ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min={minBet}
                    max={currentPlayer.chips}
                    step={Math.max(1, Math.floor((currentPlayer.chips - minBet) / 20))}
                    className="w-40 accent-yellow-500"
                  />
                  <span className="text-white font-bold text-lg w-20">${betAmount}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('bet')}
                    disabled={isProcessing || betAmount < minBet}
                    className="action-button bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1"
                  >
                    Bet ${betAmount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBetInput(false)}
                    className="action-button bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleAction('bet')}
                disabled={isProcessing}
                className="action-button bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Bet
              </button>
            )}
          </div>
        )}

        {/* Raise Button */}
        {validActions.includes('raise') && (
          <div className="flex gap-2 items-center">
            {showRaiseInput ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(Number(e.target.value))}
                    min={minRaise}
                    max={Math.max(minRaise, currentPlayer.chips - callAmount)}
                    step={Math.max(
                      1,
                      Math.floor((currentPlayer.chips - callAmount - minRaise) / 20),
                    )}
                    className="w-40 accent-yellow-500"
                  />
                  <span className="text-white font-bold text-lg w-20">${raiseAmount}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('raise')}
                    disabled={isProcessing || raiseAmount < minRaise}
                    className="action-button bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1"
                  >
                    Raise to ${callAmount + raiseAmount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRaiseInput(false)}
                    className="action-button bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
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
            onClick={() => handleAction('all-in', currentPlayer.chips)}
            disabled={isProcessing}
            className="action-button bg-purple-600 hover:bg-purple-700 text-white"
          >
            All-In (${currentPlayer.chips})
          </button>
        )}
      </div>

      {/* Helper text for bet input */}
      {showBetInput && (
        <div className="mt-2 text-sm text-gray-400">
          Min bet: ${minBet} | Max: ${currentPlayer.chips}
        </div>
      )}

      {/* Helper text for raise input */}
      {showRaiseInput && (
        <div className="mt-2 text-sm text-gray-400">
          Min raise: ${minRaise} | Call: ${callAmount} | Total: ${callAmount + raiseAmount} | Max
          chips: ${currentPlayer.chips}
        </div>
      )}
    </motion.div>
  );
}
