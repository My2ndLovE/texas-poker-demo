import { useEffect } from 'react';
import { ActionButtons } from './presentation/components/game/ActionButtons';
import { GameInfo } from './presentation/components/game/GameInfo';
import { HandRankDisplay } from './presentation/components/game/HandRankDisplay';
import { PokerTable } from './presentation/components/game/PokerTable';
import { useGameStore } from './state-management/gameStore';
import { useSettingsStore } from './state-management/settingsStore';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const settings = useSettingsStore();

  useEffect(() => {
    // Auto-start game for demo (run only once on mount)
    if (!gameState) {
      initializeGame(settings);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only once on mount
  }, []);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8 text-shadow">Texas Hold'em Poker</h1>
          <button
            type="button"
            onClick={() => initializeGame(settings)}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <GameInfo />
        </div>

        {/* Poker Table */}
        <div className="mb-6">
          <PokerTable />
        </div>

        {/* Hand Rank Display */}
        <HandRankDisplay />

        {/* Action Buttons */}
        <ActionButtons />
      </div>
    </div>
  );
}

export default App;
