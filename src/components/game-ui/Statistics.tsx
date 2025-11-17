interface StatisticsProps {
  stats: {
    handsPlayed: number
    handsWon: number
    biggestPot: number
    totalWinnings: number
    currentStreak: number
  }
  className?: string
}

export function Statistics({ stats, className = '' }: StatisticsProps) {
  const winRate = stats.handsPlayed > 0
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100)
    : 0

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg ${className}`}>
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
        Your Statistics
      </h3>

      <div className="space-y-3">
        {/* Hands played */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Hands Played</span>
          <span className="text-white font-bold">{stats.handsPlayed}</span>
        </div>

        {/* Hands won */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Hands Won</span>
          <span className="text-green-400 font-bold">{stats.handsWon}</span>
        </div>

        {/* Win rate */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Win Rate</span>
          <span className={`font-bold ${
            winRate >= 50 ? 'text-green-400' :
            winRate >= 30 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {winRate}%
          </span>
        </div>

        <div className="border-t border-gray-700 pt-3 mt-3">
          {/* Biggest pot */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">Biggest Pot</span>
            <span className="text-yellow-400 font-bold">${stats.biggestPot}</span>
          </div>

          {/* Total winnings */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">Net Winnings</span>
            <span className={`font-bold ${
              stats.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.totalWinnings >= 0 ? '+' : ''}${stats.totalWinnings}
            </span>
          </div>

          {/* Current streak */}
          {stats.currentStreak > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Win Streak</span>
              <span className="text-orange-400 font-bold">🔥 {stats.currentStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fun facts */}
      {stats.handsPlayed > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-500 text-xs text-center">
            {winRate >= 60 && '🌟 You\'re on fire!'}
            {winRate >= 40 && winRate < 60 && '👍 Solid performance!'}
            {winRate < 40 && stats.handsPlayed > 20 && '💪 Keep grinding!'}
          </div>
        </div>
      )}
    </div>
  )
}
