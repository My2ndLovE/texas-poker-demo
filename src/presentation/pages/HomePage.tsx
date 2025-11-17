import { useState } from 'react';
import { Play, Settings as SettingsIcon, HelpCircle, X } from 'lucide-react';
import type { GameSettings } from '@/types';

interface HomePageProps {
  onStartGame: (settings: GameSettings) => void;
  defaultSettings: GameSettings;
}

export default function HomePage({ onStartGame, defaultSettings }: HomePageProps) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleQuickPlay = () => {
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Poker chips decoration */}
              <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-lg hidden md:block" />
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg hidden md:block" />

              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
                🎰 Texas Hold'em
              </h1>
            </div>
          </div>
          <p className="text-lg md:text-2xl text-white/90 font-semibold mb-2">
            Play poker with intelligent bot opponents
          </p>
          <div className="flex justify-center gap-2 text-sm text-white/70">
            <span className="bg-purple-600/30 px-3 py-1 rounded-full">React + TypeScript</span>
            <span className="bg-blue-600/30 px-3 py-1 rounded-full">XState</span>
            <span className="bg-green-600/30 px-3 py-1 rounded-full">Tailwind CSS</span>
          </div>
        </div>

        {/* Main Menu Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-gray-700 relative overflow-hidden">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

          {!showSettings ? (
            <div className="space-y-4 relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to Play?</h2>
                <p className="text-gray-400">Choose your game mode below</p>
              </div>

              {/* Quick Play Button */}
              <button
                onClick={handleQuickPlay}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-xl shadow-lg group"
              >
                <Play className="w-7 h-7 group-hover:animate-pulse" />
                <span>Quick Play</span>
                <div className="text-sm font-normal opacity-80 ml-2">
                  ({settings.numBots} bots, {settings.botDifficulty} difficulty)
                </div>
              </button>

              {/* Secondary Buttons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-700/80 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>Custom Settings</span>
                </button>

                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-gray-700/80 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>How to Play</span>
                </button>
              </div>

              {/* Game Features */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Game Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-2xl mb-1">🤖</div>
                    <div className="text-sm text-gray-300 font-semibold">Smart AI Bots</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm text-gray-300 font-semibold">Hand Strength</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-2xl mb-1">🎨</div>
                    <div className="text-sm text-gray-300 font-semibold">Beautiful UI</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-sm text-gray-300 font-semibold">Fast Gameplay</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Game Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Settings Form */}
              <div className="space-y-5">
                {/* Number of Bots */}
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <label className="block text-sm font-semibold mb-3 text-white">
                    Number of Bots: <span className="text-green-400 text-lg">{settings.numBots}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={settings.numBots}
                    onChange={(e) =>
                      setSettings({ ...settings, numBots: parseInt(e.target.value) })
                    }
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                  </div>
                </div>

                {/* Bot Difficulty */}
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <label className="block text-sm font-semibold mb-3 text-white">Bot Difficulty</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['easy', 'medium', 'hard', 'mixed'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSettings({ ...settings, botDifficulty: diff })}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          settings.botDifficulty === diff
                            ? 'bg-green-600 text-white shadow-lg scale-105'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starting Chips */}
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <label className="block text-sm font-semibold mb-3 text-white">
                    Starting Chips: <span className="text-yellow-400">${settings.startingChips}</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[500, 1000, 2000, 5000].map((chips) => (
                      <button
                        key={chips}
                        onClick={() => setSettings({ ...settings, startingChips: chips })}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          settings.startingChips === chips
                            ? 'bg-yellow-600 text-white shadow-lg scale-105'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        ${chips}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blinds */}
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <label className="block text-sm font-semibold mb-3 text-white">Blinds</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2 font-semibold">Small Blind</label>
                      <input
                        type="number"
                        value={settings.smallBlind}
                        onChange={(e) =>
                          setSettings({ ...settings, smallBlind: parseInt(e.target.value) || 5 })
                        }
                        className="w-full bg-gray-700 border-2 border-gray-600 focus:border-blue-500 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none transition-colors"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2 font-semibold">Big Blind</label>
                      <input
                        type="number"
                        value={settings.bigBlind}
                        onChange={(e) =>
                          setSettings({ ...settings, bigBlind: parseInt(e.target.value) || 10 })
                        }
                        className="w-full bg-gray-700 border-2 border-gray-600 focus:border-blue-500 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none transition-colors"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    onStartGame(settings);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Game</span>
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Version Info */}
        <div className="text-center mt-6 text-white/50 text-sm">
          <p>Version 1.0.0 | Built with React + TypeScript + XState</p>
        </div>
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">How to Play Texas Hold'em</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              {/* Game Objective */}
              <div className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-3">🎯 Objective</h3>
                <p>
                  Win chips by making the best five-card poker hand using your two hole cards
                  and five community cards, or by making all other players fold.
                </p>
              </div>

              {/* Game Flow */}
              <div className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-3">🔄 Game Flow</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Blinds Posted:</strong> Small blind and big blind are posted</li>
                  <li><strong>Hole Cards:</strong> Each player receives 2 private cards</li>
                  <li><strong>Pre-Flop Betting:</strong> First betting round</li>
                  <li><strong>Flop:</strong> 3 community cards dealt, second betting round</li>
                  <li><strong>Turn:</strong> 4th community card dealt, third betting round</li>
                  <li><strong>River:</strong> 5th community card dealt, final betting round</li>
                  <li><strong>Showdown:</strong> Best hand wins the pot</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-3">🎮 Actions</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <strong className="text-red-400">Fold:</strong> Give up your hand
                  </div>
                  <div>
                    <strong className="text-gray-400">Check:</strong> Pass when no bet to call
                  </div>
                  <div>
                    <strong className="text-blue-400">Call:</strong> Match the current bet
                  </div>
                  <div>
                    <strong className="text-green-400">Raise:</strong> Increase the current bet
                  </div>
                  <div>
                    <strong className="text-orange-400">All-In:</strong> Bet all your chips
                  </div>
                </div>
              </div>

              {/* Hand Rankings */}
              <div className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-3">🏆 Hand Rankings (Best to Worst)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Royal Flush: A♥ K♥ Q♥ J♥ 10♥</li>
                  <li>Straight Flush: Five cards in sequence, same suit</li>
                  <li>Four of a Kind: Four cards of the same rank</li>
                  <li>Full House: Three of a kind + pair</li>
                  <li>Flush: Five cards of same suit</li>
                  <li>Straight: Five cards in sequence</li>
                  <li>Three of a Kind: Three cards of same rank</li>
                  <li>Two Pair: Two different pairs</li>
                  <li>Pair: Two cards of same rank</li>
                  <li>High Card: Highest card wins</li>
                </ol>
              </div>

              {/* UI Features */}
              <div className="bg-gray-800/50 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-3">💡 UI Features</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Hand Strength Indicator:</strong> Shows your hand quality with a color-coded bar</li>
                  <li><strong>Action History:</strong> Track all player actions (left panel)</li>
                  <li><strong>Game Info:</strong> View blinds and current bet (right panel)</li>
                  <li><strong>Raise Slider:</strong> Use the slider for precise raise amounts</li>
                  <li><strong>Dev Mode:</strong> Toggle debug info with top-right button</li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-5 border-2 border-yellow-600/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">💎 Pro Tips</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Pay attention to the hand strength indicator</li>
                  <li>Watch the dealer button (D) to track betting order</li>
                  <li>Use the action history to analyze opponent patterns</li>
                  <li>The raise slider lets you bet precise amounts</li>
                  <li>Start with lower difficulty bots to learn</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
