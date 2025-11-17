import { useGameStore } from '@/state-management/gameStore';
import { RotateCcw, Settings } from 'lucide-react';

export function GameInfo() {
  const gameState = useGameStore((state) => state.gameState);
  const startNewHand = useGameStore((state) => state.startNewHand);

  if (!gameState) return null;

  const phaseDisplay: Record<string, string> = {
    menu: 'Menu',
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
    'hand-complete': 'Hand Complete',
    'game-over': 'Game Over',
  };

  return (
    <div className="flex justify-between items-center bg-gray-800/90 p-4 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Texas Hold'em Poker</h1>
        <div className="flex gap-4 text-sm">
          <p className="text-gray-400">
            Blinds: ${gameState.smallBlindAmount}/${gameState.bigBlindAmount}
          </p>
          <p className="text-yellow-400 font-semibold">
            Phase: {phaseDisplay[gameState.phase] || gameState.phase}
          </p>
          <p className="text-green-400 font-semibold">Pot: ${gameState.pot.totalPot}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {gameState.phase === 'hand-complete' && (
          <button
            type="button"
            onClick={startNewHand}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Next Hand
          </button>
        )}

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
