import { useGameStore } from '@/state-management/gameStore';
import { useSettingsStore } from '@/state-management/settingsStore';

export function MainMenu() {
  const initializeGame = useGameStore((state) => state.initializeGame);
  const settings = useSettingsStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 text-shadow">Texas Hold'em Poker</h1>
        <p className="text-xl text-gray-400 mb-12">Play against intelligent AI opponents</p>

        <button
          onClick={() => initializeGame(settings)}
          className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
        >
          Start Game
        </button>

        <div className="mt-8 text-sm text-gray-500">
          <p>Built with React + TypeScript + Zustand + Framer Motion</p>
        </div>
      </div>
    </div>
  );
}
