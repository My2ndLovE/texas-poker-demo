import { Player } from '../../game-logic/models/Player'
import { Card } from '../cards/Card'

interface PlayerSeatProps {
  player: Player
  isCurrentPlayer?: boolean
  isActive?: boolean
  showCards?: boolean
  className?: string
}

const avatarColors = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-green-700',
  'bg-gradient-to-br from-purple-500 to-purple-700',
  'bg-gradient-to-br from-pink-500 to-pink-700',
  'bg-gradient-to-br from-yellow-500 to-yellow-700',
  'bg-gradient-to-br from-red-500 to-red-700',
]

export function PlayerSeat({
  player,
  isCurrentPlayer = false,
  isActive = false,
  showCards = false,
  className = '',
}: PlayerSeatProps) {
  const avatarColor = avatarColors[parseInt(player.id.replace(/\D/g, '')) % avatarColors.length]
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const getStatusColor = () => {
    switch (player.status) {
      case 'active':
        return 'border-green-500'
      case 'folded':
        return 'border-gray-500 opacity-50'
      case 'all-in':
        return 'border-yellow-500'
      case 'sitting-out':
        return 'border-gray-400 opacity-30'
      default:
        return 'border-gray-600'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Active turn indicator */}
      {isActive && (
        <div className="absolute -inset-2 rounded-lg border-4 border-yellow-400 animate-pulse"></div>
      )}

      <div
        className={`bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border-2 ${getStatusColor()} shadow-xl transition-all`}
      >
        {/* Player info */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div
            className={`w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <div className="text-white font-semibold truncate">{player.name}</div>

            {/* Chips */}
            <div className="text-yellow-400 font-bold text-sm">
              ${player.chips.toLocaleString()}
            </div>
          </div>

          {/* Position indicators */}
          <div className="flex flex-col gap-1">
            {player.isDealer && (
              <div className="bg-white text-gray-900 text-xs font-bold px-2 py-0.5 rounded">
                D
              </div>
            )}
            {player.isSmallBlind && (
              <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                SB
              </div>
            )}
            {player.isBigBlind && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                BB
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        {player.hasCards() && (
          <div className="flex gap-1 mb-2">
            {showCards || isCurrentPlayer ? (
              player.holeCards.map((card, index) => (
                <Card key={index} card={card} size="small" />
              ))
            ) : (
              <>
                <Card card={null} faceDown={true} size="small" />
                <Card card={null} faceDown={true} size="small" />
              </>
            )}
          </div>
        )}

        {/* Current bet */}
        {player.currentBet > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded px-2 py-1 text-center">
            <div className="text-yellow-400 text-xs font-semibold">Bet</div>
            <div className="text-white font-bold">${player.currentBet}</div>
          </div>
        )}

        {/* Status text */}
        {player.status === 'folded' && (
          <div className="text-gray-400 text-xs text-center mt-1">Folded</div>
        )}
        {player.status === 'all-in' && (
          <div className="text-yellow-400 text-xs text-center mt-1 font-bold">ALL IN!</div>
        )}
      </div>
    </div>
  )
}
