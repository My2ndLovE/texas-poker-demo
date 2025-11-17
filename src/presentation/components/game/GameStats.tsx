import { useState } from 'react';

export interface GameStatistics {
  handsPlayed: number;
  handsWon: number;
  biggestPotWon: number;
  totalWinnings: number;
  startingChips: number;
}

interface GameStatsProps {
  stats: GameStatistics;
  currentChips: number;
}

export default function GameStats({ stats, currentChips }: GameStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const winRate = stats.handsPlayed > 0 ? ((stats.handsWon / stats.handsPlayed) * 100).toFixed(1) : '0.0';
  const netProfit = currentChips - stats.startingChips;
  const isProfit = netProfit >= 0;

  return (
    <>
      {/* Stats Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg transition-all active:scale-95 touch-manipulation"
        aria-label="Toggle statistics"
      >
        📊
      </button>

      {/* Stats Panel */}
      {isOpen && (
        <div className="absolute top-16 right-4 z-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-5 min-w-[280px] border-2 border-gray-700 animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close statistics"
          >
            ✕
          </button>

          {/* Title */}
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span>📊</span>
            Session Stats
          </h3>

          {/* Stats Grid */}
          <div className="space-y-3">
            {/* Hands Played */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Hands Played</div>
              <div className="text-white font-bold text-xl">{stats.handsPlayed}</div>
            </div>

            {/* Hands Won */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Hands Won</div>
              <div className="flex items-center justify-between">
                <div className="text-green-400 font-bold text-xl">{stats.handsWon}</div>
                <div className="text-green-400 text-sm font-semibold">{winRate}%</div>
              </div>
            </div>

            {/* Biggest Pot */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Biggest Pot Won</div>
              <div className="text-yellow-400 font-bold text-xl">${stats.biggestPotWon}</div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`rounded-lg p-3 ${isProfit ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'}`}>
              <div className="text-gray-300 text-xs mb-1">Net Profit/Loss</div>
              <div className={`font-bold text-xl ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}${netProfit}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Started with ${stats.startingChips}
              </div>
            </div>

            {/* Current Chips */}
            <div className="bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-lg p-3">
              <div className="text-yellow-200 text-xs mb-1">Current Chips</div>
              <div className="text-white font-bold text-2xl">${currentChips}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
