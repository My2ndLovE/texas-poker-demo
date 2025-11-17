import { Player } from '@/game-logic/models/Player';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isDealer: boolean;
  showCards: boolean;
}

export default function PlayerCard({ player, isCurrentPlayer, isDealer, showCards }: PlayerCardProps) {
  const statusColor = {
    active: 'bg-green-500',
    folded: 'bg-gray-500',
    'all-in': 'bg-yellow-500',
    eliminated: 'bg-red-500',
  }[player.status];

  const statusGlow = {
    active: 'shadow-green-500/50',
    folded: 'shadow-gray-500/50',
    'all-in': 'shadow-yellow-500/50 animate-pulse',
    eliminated: 'shadow-red-500/50',
  }[player.status];

  return (
    <div className={`relative transition-all duration-300 ${isCurrentPlayer ? 'ring-4 ring-yellow-400 ring-opacity-100 animate-pulse' : ''}`}>
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 shadow-2xl min-w-[140px] border-2 ${
        isCurrentPlayer ? 'border-yellow-400' : player.status === 'all-in' ? 'border-yellow-500' : 'border-gray-700'
      } ${statusGlow} transition-all duration-300`}>
        {/* Dealer button */}
        {isDealer && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm border-3 border-gray-800 shadow-lg animate-bounce">
            <span className="text-white">D</span>
          </div>
        )}

        {/* All-in badge */}
        {player.status === 'all-in' && (
          <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
            ALL-IN
          </div>
        )}

        {/* Player name */}
        <div className={`font-semibold text-sm mb-1 ${
          isCurrentPlayer ? 'text-yellow-300' : 'text-white'
        }`}>
          {player.name}
        </div>

        {/* Chips with icon */}
        <div className="flex items-center gap-1 mb-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-[10px]">
            💰
          </div>
          <span className="text-yellow-400 font-bold text-sm">${player.chips}</span>
        </div>

        {/* Current bet */}
        {player.currentBet > 0 && (
          <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded px-2 py-1 text-green-400 text-xs font-semibold mb-2">
            Bet: ${player.currentBet}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-1 mb-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} ${
            player.status === 'active' || player.status === 'all-in' ? 'animate-pulse' : ''
          }`}></div>
          <div className={`text-xs font-medium capitalize ${
            player.status === 'folded' ? 'text-gray-500' : 'text-gray-300'
          }`}>
            {player.status}
          </div>
        </div>

        {/* Cards */}
        {player.holeCards.length > 0 && (
          <div className="flex gap-1">
            {showCards ? (
              player.holeCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-md px-2 py-2 text-sm font-bold shadow-md transform hover:scale-110 transition-transform"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{card.rank}</span>
                    <span className={`text-base ${card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black'}`}>
                      {getSuitSymbol(card.suit)}
                    </span>
                  </div>
                </div>
              ))
            ) : player.status !== 'folded' ? (
              <>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-md px-2 py-2 text-xs text-white shadow-md border border-blue-500">
                  🂠
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-md px-2 py-2 text-xs text-white shadow-md border border-blue-500">
                  🂠
                </div>
              </>
            ) : (
              <div className="text-gray-600 text-xs italic">Folded</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getSuitSymbol(suit: string): string {
  return { h: '♥', d: '♦', c: '♣', s: '♠' }[suit] || suit;
}
