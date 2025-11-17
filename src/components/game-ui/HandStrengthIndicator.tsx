import { Card } from '../../game-logic/models/Card'

interface HandStrengthProps {
  holeCards: Card[]
  communityCards: Card[]
  gamePhase: string
  className?: string
}

// Simplified equity calculator based on hand strength
function calculateEquity(holeCards: Card[], communityCards: Card[], gamePhase: string): number {
  if (holeCards.length !== 2) return 0

  const card1 = holeCards[0]!
  const card2 = holeCards[1]!
  const val1 = card1.getValue()
  const val2 = card2.getValue()
  const isPair = val1 === val2
  const isSuited = card1.suit === card2.suit
  const highCard = Math.max(val1, val2)

  // Preflop equity
  if (gamePhase === 'preflop' || communityCards.length === 0) {
    if (isPair) {
      if (highCard >= 13) return 85 // AA, KK
      if (highCard >= 11) return 80 // QQ, JJ
      if (highCard >= 9) return 72 // TT, 99
      return 65 // Small pairs
    }
    if (highCard >= 13 && val2 >= 12) return isSuited ? 67 : 65 // AK, AQ
    if (highCard >= 13) return isSuited ? 55 : 50 // Ax suited/offsuit
    if (highCard >= 11) return isSuited ? 60 : 55 // High cards
    return isSuited ? 45 : 38 // Medium/low cards
  }

  // Post-flop: simplified based on preflop strength and board
  const preflopStrength = isPair ? 70 : highCard >= 12 ? 60 : 50
  const boardFactor = communityCards.length * 5 // Rough adjustment
  return Math.min(95, Math.max(15, preflopStrength + (Math.random() * 20 - 10) + boardFactor))
}

function getStrengthLabel(equity: number): { label: string; color: string } {
  if (equity >= 80) return { label: 'Very Strong', color: 'text-green-400' }
  if (equity >= 65) return { label: 'Strong', color: 'text-green-500' }
  if (equity >= 50) return { label: 'Good', color: 'text-blue-400' }
  if (equity >= 35) return { label: 'Playable', color: 'text-yellow-400' }
  if (equity >= 20) return { label: 'Weak', color: 'text-orange-400' }
  return { label: 'Very Weak', color: 'text-red-400' }
}

export function HandStrengthIndicator({ holeCards, communityCards, gamePhase, className = '' }: HandStrengthProps) {
  const equity = calculateEquity(holeCards, communityCards, gamePhase)
  const { label, color } = getStrengthLabel(equity)

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg ${className}`}>
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
        Hand Strength
      </h3>

      {/* Equity percentage */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-gray-400 text-sm">Win Probability</span>
          <span className={`text-2xl font-bold ${color}`}>{equity}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              equity >= 65 ? 'bg-green-500' :
              equity >= 50 ? 'bg-blue-500' :
              equity >= 35 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${equity}%` }}
          ></div>
        </div>
      </div>

      {/* Strength label */}
      <div className="text-center">
        <div className={`${color} font-bold text-lg`}>{label}</div>
        <div className="text-gray-500 text-xs mt-1">
          {gamePhase === 'preflop' ? 'Preflop Strength' : 'Current Equity'}
        </div>
      </div>

      {/* Quick tip */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          {equity >= 65 && '💪 Strong hand - consider raising'}
          {equity >= 50 && equity < 65 && '👍 Solid hand - play carefully'}
          {equity >= 35 && equity < 50 && '⚠️ Marginal - consider position'}
          {equity < 35 && '❌ Weak hand - fold vs raises'}
        </div>
      </div>
    </div>
  )
}
