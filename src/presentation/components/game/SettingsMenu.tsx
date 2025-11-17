import { useState } from 'react';
import { BotDifficulty } from '@/bot-ai/BotPlayer';

interface SettingsMenuProps {
  onStart: (settings: GameSettings) => void;
}

export interface GameSettings {
  playerName: string;
  numBots: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  botDifficulty: BotDifficulty;
}

export default function SettingsMenu({ onStart }: SettingsMenuProps) {
  const [playerName, setPlayerName] = useState('You');
  const [numBots, setNumBots] = useState(5);
  const [startingChips, setStartingChips] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');

  const presets = {
    quick: { chips: 500, sb: 5, bb: 10, bots: 3 },
    normal: { chips: 1000, sb: 10, bb: 20, bots: 5 },
    tournament: { chips: 2000, sb: 20, bb: 40, bots: 8 },
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setStartingChips(presets[preset].chips);
    setSmallBlind(presets[preset].sb);
    setBigBlind(presets[preset].bb);
    setNumBots(presets[preset].bots);
  };

  const handleStart = () => {
    onStart({
      playerName,
      numBots,
      startingChips,
      smallBlind,
      bigBlind,
      botDifficulty,
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-poker-green-dark via-poker-green to-poker-green-dark flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-yellow-500 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
            🃏 Texas Hold'em
          </h1>
          <p className="text-gray-400 text-sm">Configure your game settings</p>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="text-white text-sm font-semibold mb-2 block">Quick Start</label>
          <div className="flex gap-3">
            <button
              onClick={() => applyPreset('quick')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all active:scale-95"
            >
              <div className="font-bold">Quick Game</div>
              <div className="text-xs opacity-80">3 bots • $500 chips</div>
            </button>
            <button
              onClick={() => applyPreset('normal')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all active:scale-95"
            >
              <div className="font-bold">Normal Game</div>
              <div className="text-xs opacity-80">5 bots • $1000 chips</div>
            </button>
            <button
              onClick={() => applyPreset('tournament')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-all active:scale-95"
            >
              <div className="font-bold">Tournament</div>
              <div className="text-xs opacity-80">8 bots • $2000 chips</div>
            </button>
          </div>
        </div>

        {/* Custom Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Player Name */}
          <div>
            <label className="text-white text-sm font-semibold mb-2 block">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Number of Bots */}
          <div>
            <label className="text-white text-sm font-semibold mb-2 block">
              Opponents ({numBots} bots)
            </label>
            <input
              type="range"
              min="1"
              max="9"
              value={numBots}
              onChange={(e) => setNumBots(Number(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
              <span>9</span>
            </div>
          </div>

          {/* Starting Chips */}
          <div>
            <label className="text-white text-sm font-semibold mb-2 block">Starting Chips</label>
            <select
              value={startingChips}
              onChange={(e) => setStartingChips(Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none cursor-pointer"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={2000}>$2,000</option>
              <option value={5000}>$5,000</option>
              <option value={10000}>$10,000</option>
            </select>
          </div>

          {/* Blinds */}
          <div>
            <label className="text-white text-sm font-semibold mb-2 block">Blinds</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={smallBlind}
                  onChange={(e) => setSmallBlind(Number(e.target.value))}
                  min={1}
                  className="w-full bg-gray-700 text-white px-3 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-center"
                  placeholder="SB"
                />
                <div className="text-xs text-gray-400 text-center mt-1">Small</div>
              </div>
              <div className="flex items-center text-gray-400">/</div>
              <div className="flex-1">
                <input
                  type="number"
                  value={bigBlind}
                  onChange={(e) => setBigBlind(Number(e.target.value))}
                  min={smallBlind}
                  className="w-full bg-gray-700 text-white px-3 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-center"
                  placeholder="BB"
                />
                <div className="text-xs text-gray-400 text-center mt-1">Big</div>
              </div>
            </div>
          </div>

          {/* Bot Difficulty */}
          <div className="md:col-span-2">
            <label className="text-white text-sm font-semibold mb-2 block">Bot Difficulty</label>
            <div className="flex gap-3">
              <button
                onClick={() => setBotDifficulty('easy')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  botDifficulty === 'easy'
                    ? 'bg-green-600 text-white ring-2 ring-green-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                😊 Easy
              </button>
              <button
                onClick={() => setBotDifficulty('medium')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  botDifficulty === 'medium'
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                😐 Medium
              </button>
              <button
                onClick={() => setBotDifficulty('hard')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  botDifficulty === 'hard'
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                😤 Hard
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!playerName.trim() || bigBlind <= smallBlind}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg"
        >
          🎮 Start Game
        </button>

        {/* Tips */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>💡 Tip: Big blind should be at least 2x the small blind</p>
        </div>
      </div>
    </div>
  );
}
