import { useState } from 'react';
import { Play, Settings as SettingsIcon } from 'lucide-react';
import type { GameSettings } from '@/types';

interface HomePageProps {
  onStartGame: (settings: GameSettings) => void;
  defaultSettings: GameSettings;
}

export default function HomePage({ onStartGame, defaultSettings }: HomePageProps) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  const handleQuickPlay = () => {
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
            Texas Hold'em
          </h1>
          <p className="text-xl text-white/80">
            Play poker with intelligent bot opponents
          </p>
        </div>

        {/* Main Menu */}
        <div className="bg-gray-800/90 backdrop-blur rounded-2xl p-8 shadow-2xl">
          {!showSettings ? (
            <div className="space-y-4">
              {/* Quick Play Button */}
              <button
                onClick={handleQuickPlay}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
              >
                <Play className="w-6 h-6" />
                Quick Play
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                <SettingsIcon className="w-5 h-5" />
                Settings
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Game Settings</h2>

              {/* Number of Bots */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Bots: {settings.numBots}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.numBots}
                  onChange={(e) =>
                    setSettings({ ...settings, numBots: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Bot Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-2">Bot Difficulty</label>
                <select
                  value={settings.botDifficulty}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      botDifficulty: e.target.value as GameSettings['botDifficulty'],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Starting Chips */}
              <div>
                <label className="block text-sm font-medium mb-2">Starting Chips</label>
                <select
                  value={settings.startingChips}
                  onChange={(e) =>
                    setSettings({ ...settings, startingChips: parseInt(e.target.value) })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                  <option value="2000">2000</option>
                  <option value="5000">5000</option>
                </select>
              </div>

              {/* Blinds */}
              <div>
                <label className="block text-sm font-medium mb-2">Blinds</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Small Blind</label>
                    <input
                      type="number"
                      value={settings.smallBlind}
                      onChange={(e) =>
                        setSettings({ ...settings, smallBlind: parseInt(e.target.value) })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Big Blind</label>
                    <input
                      type="number"
                      value={settings.bigBlind}
                      onChange={(e) =>
                        setSettings({ ...settings, bigBlind: parseInt(e.target.value) })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    onStartGame(settings);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Start Game
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Version Info */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Version 1.0.0 | Built with React + TypeScript + XState</p>
        </div>
      </div>
    </div>
  );
}
