import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/state-management/gameStore';

export const StartMenu: React.FC = () => {
  const navigate = useNavigate();
  const { initializeGame, setBotDifficulty } = useGameStore();

  const [playerName, setPlayerName] = useState('Player');
  const [botCount, setBotCount] = useState(3);
  const [startingChips, setStartingChips] = useState(1000);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleStartGame = () => {
    setBotDifficulty(difficulty);
    initializeGame(playerName, botCount, startingChips);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
      <div className="bg-gray-800 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">Texas Hold'em Poker</h1>

        <div className="space-y-6">
          {/* Player Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Bot Count */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Bots: {botCount}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={botCount}
              onChange={(e) => setBotCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Starting Chips */}
          <div>
            <label className="block text-sm font-medium mb-2">Starting Chips</label>
            <select
              value={startingChips}
              onChange={(e) => setStartingChips(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={2000}>$2,000</option>
              <option value={5000}>$5,000</option>
            </select>
          </div>

          {/* Bot Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">Bot Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 rounded-lg font-medium transition ${
                    difficulty === level
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg font-bold text-xl transition transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
