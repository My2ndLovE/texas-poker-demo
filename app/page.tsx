'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { PokerTable } from '@/components/game/poker-table';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const startGame = useGameStore((state) => state.startGame);

  const handleStartGame = () => {
    if (playerName.trim()) {
      startGame(playerName);
      setGameStarted(true);
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-800 to-green-900 p-8">
        <div className="flex flex-col items-center gap-8 rounded-2xl bg-white/10 p-12 backdrop-blur-sm">
          <h1 className="text-5xl font-bold text-white">Texas Hold'em Poker</h1>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="rounded-lg border-2 border-white/30 bg-white/20 px-6 py-3 text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
            />
            <button
              onClick={handleStartGame}
              disabled={!playerName.trim()}
              className="rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold text-black shadow-lg transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Game
            </button>
          </div>
          <div className="text-center text-white/70">
            <p>Play Texas Hold'em against 5 AI opponents</p>
            <p className="text-sm">Starting chips: $1,000 | Blinds: $5/$10</p>
          </div>
        </div>
      </div>
    );
  }

  return <PokerTable />;
}
