import { useGameStore } from '@/state-management/gameStore';
import { Settings, RotateCcw } from 'lucide-react';

export function GameInfo() {
  const gameState = useGameStore((state) => state.gameState);
  const startNewHand = useGameStore((state) => state.startNewHand);

  if (!gameState) return null;

  return (
    <div className="flex justify-between items-center bg-gray-800/90 p-4 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Texas Hold'em Poker</h1>
        <p className="text-gray-400 text-sm">
          Blinds: ${gameState.smallBlindAmount}/${gameState.bigBlindAmount}
        </p>
      </div>

      <div className="flex gap-4">
        {gameState.phase === 'hand-complete' && (
          <button
            onClick={startNewHand}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Next Hand
          </button>
        )}

        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
