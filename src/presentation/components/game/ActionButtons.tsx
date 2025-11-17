import { useState } from 'react';
import { useGameStore } from '@/state-management/gameStore';

export default function ActionButtons() {
  const { gameState, playerAction } = useGameStore();
  const [raiseAmount, setRaiseAmount] = useState(0);

  if (!gameState) return null;

  const humanPlayer = gameState.players.find((p) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!humanPlayer || !currentPlayer || currentPlayer.isBot) {
    return (
      <div className="container mx-auto text-center text-white">
        <p>Waiting for bot actions...</p>
      </div>
    );
  }

  const callAmount = gameState.currentBet - humanPlayer.currentBet;
  const canCheck = callAmount === 0;
  const minRaise = gameState.currentBet * 2;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        {/* Fold Button */}
        <button
          onClick={() => playerAction('fold')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors min-w-[120px]"
        >
          Fold
        </button>

        {/* Check/Call Button */}
        <button
          onClick={() => playerAction(canCheck ? 'check' : 'call')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors min-w-[120px]"
        >
          {canCheck ? 'Check' : `Call $${callAmount}`}
        </button>

        {/* Raise Section */}
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            min={minRaise}
            max={humanPlayer.chips + humanPlayer.currentBet}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg w-32"
            placeholder={`Min $${minRaise}`}
          />
          <button
            onClick={() => {
              if (raiseAmount >= minRaise) {
                playerAction('raise', raiseAmount);
                setRaiseAmount(0);
              }
            }}
            disabled={raiseAmount < minRaise}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors min-w-[120px]"
          >
            Raise
          </button>
        </div>

        {/* All-In Button */}
        <button
          onClick={() => playerAction('raise', humanPlayer.chips + humanPlayer.currentBet)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors min-w-[120px]"
        >
          All-In (${humanPlayer.chips})
        </button>
      </div>
    </div>
  );
}
