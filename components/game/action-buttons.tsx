'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { createAction } from '@/lib/game-logic/models/Action';
import { bettingRules } from '@/lib/game-logic/rules/BettingRules';
import { cn } from '@/lib/utils/cn';

export function ActionButtons() {
  const { players, currentPlayerIndex, processPlayerAction, phase } = useGameStore();
  const [raiseAmount, setRaiseAmount] = useState<number | null>(null);

  if (phase === 'waiting' || phase === 'complete') {
    return null;
  }

  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer || currentPlayer.isBot) {
    return (
      <div className="text-center text-white">
        <div className="text-lg">{currentPlayer?.name}'s turn...</div>
      </div>
    );
  }

  const gameState = useGameStore.getState();
  const validActions = bettingRules.getValidActions(gameState, currentPlayer);

  const handleFold = () => {
    processPlayerAction(createAction('fold', currentPlayer.id));
  };

  const handleCheck = () => {
    processPlayerAction(createAction('check', currentPlayer.id));
  };

  const handleCall = () => {
    processPlayerAction(createAction('call', currentPlayer.id, validActions.callAmount));
  };

  const handleRaise = (customAmount?: number) => {
    const amount = customAmount || raiseAmount || validActions.minRaise;
    const finalAmount = Math.min(amount, currentPlayer.chips);
    processPlayerAction(createAction('raise', currentPlayer.id, finalAmount));
    setRaiseAmount(null); // Reset after action
  };

  const handleAllIn = () => {
    processPlayerAction(createAction('all-in', currentPlayer.id, currentPlayer.chips));
  };

  // Initialize raise amount to minimum if not set
  const currentRaiseAmount = raiseAmount || validActions.minRaise;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center text-white">
        <div className="text-lg font-bold">Your Turn!</div>
        <div className="text-sm">Choose your action</div>
      </div>

      {/* Raise Slider */}
      {validActions.canRaise && (
        <div className="w-full max-w-md rounded-lg bg-black/30 p-4">
          <div className="mb-2 flex justify-between text-sm text-white">
            <span>Raise Amount:</span>
            <span className="font-bold text-yellow-400">${currentRaiseAmount}</span>
          </div>
          <input
            type="range"
            min={validActions.minRaise}
            max={currentPlayer.chips}
            step={gameState.settings.bigBlind}
            value={currentRaiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-full cursor-pointer accent-yellow-500"
          />
          <div className="mt-1 flex justify-between text-xs text-white/70">
            <span>Min: ${validActions.minRaise}</span>
            <span>Max: ${currentPlayer.chips}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleFold}
          className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-red-700"
        >
          Fold
        </button>

        {validActions.canCheck && (
          <button
            onClick={handleCheck}
            className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            Check
          </button>
        )}

        {validActions.canCall && (
          <button
            onClick={handleCall}
            className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-green-700"
          >
            Call ${validActions.callAmount}
          </button>
        )}

        {validActions.canRaise && (
          <button
            onClick={() => handleRaise()}
            className="rounded-lg bg-yellow-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-yellow-700"
          >
            Raise ${currentRaiseAmount}
          </button>
        )}

        {validActions.canAllIn && (
          <button
            onClick={handleAllIn}
            className="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-purple-700"
          >
            All-In ${currentPlayer.chips}
          </button>
        )}
      </div>
    </div>
  );
}
