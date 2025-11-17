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

  return (
    <div className={`relative ${isCurrentPlayer ? 'ring-4 ring-yellow-400' : ''}`}>
      <div className="bg-gray-800 rounded-lg p-3 shadow-lg min-w-[120px]">
        {/* Dealer button */}
        {isDealer && (
          <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-gray-800">
            D
          </div>
        )}

        {/* Player name */}
        <div className="text-white font-semibold text-sm mb-1">{player.name}</div>

        {/* Chips */}
        <div className="text-yellow-400 font-bold text-xs mb-2">${player.chips}</div>

        {/* Current bet */}
        {player.currentBet > 0 && (
          <div className="text-green-400 text-xs mb-2">Bet: ${player.currentBet}</div>
        )}

        {/* Status */}
        <div className="flex items-center gap-1 mb-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <div className="text-gray-400 text-xs capitalize">{player.status}</div>
        </div>

        {/* Cards */}
        {player.holeCards.length > 0 && (
          <div className="flex gap-1">
            {showCards ? (
              player.holeCards.map((card, i) => (
                <div key={i} className="bg-white rounded px-2 py-1 text-xs font-bold">
                  {card.rank}
                  <span className={card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black'}>
                    {getSuitSymbol(card.suit)}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="bg-blue-600 rounded px-2 py-1 text-xs text-white">🂠</div>
                <div className="bg-blue-600 rounded px-2 py-1 text-xs text-white">🂠</div>
              </>
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
