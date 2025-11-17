import { Card as CardModel, Rank, Suit } from '../../game-logic/models/Card'

interface CardProps {
  card: CardModel | null
  faceDown?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const suitSymbols: Record<Suit, string> = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Clubs]: '♣',
  [Suit.Spades]: '♠',
}

const suitColors: Record<Suit, string> = {
  [Suit.Hearts]: 'text-red-600',
  [Suit.Diamonds]: 'text-red-600',
  [Suit.Clubs]: 'text-gray-900',
  [Suit.Spades]: 'text-gray-900',
}

const rankDisplay: Record<Rank, string> = {
  [Rank.Two]: '2',
  [Rank.Three]: '3',
  [Rank.Four]: '4',
  [Rank.Five]: '5',
  [Rank.Six]: '6',
  [Rank.Seven]: '7',
  [Rank.Eight]: '8',
  [Rank.Nine]: '9',
  [Rank.Ten]: '10',
  [Rank.Jack]: 'J',
  [Rank.Queen]: 'Q',
  [Rank.King]: 'K',
  [Rank.Ace]: 'A',
}

const sizeClasses = {
  small: 'w-12 h-16 text-sm',
  medium: 'w-16 h-24 text-base',
  large: 'w-20 h-28 text-lg',
}

export function Card({ card, faceDown = false, size = 'medium', className = '' }: CardProps) {
  const sizeClass = sizeClasses[size]

  if (!card || faceDown) {
    return (
      <div
        className={`${sizeClass} ${className} bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg border-2 border-blue-700 shadow-lg flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full grid grid-cols-3 grid-rows-4 gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-blue-600 rounded-sm"></div>
            ))}
          </div>
        </div>
        <div className="text-blue-300 font-bold text-2xl opacity-30">★</div>
      </div>
    )
  }

  const suit = suitSymbols[card.suit]
  const suitColor = suitColors[card.suit]
  const rank = rankDisplay[card.rank]

  return (
    <div
      className={`${sizeClass} ${className} bg-white rounded-lg border-2 border-gray-300 shadow-lg p-2 flex flex-col justify-between relative transition-transform hover:scale-105`}
    >
      {/* Top left corner */}
      <div className="flex flex-col items-center leading-none">
        <span className={`font-bold ${suitColor}`}>{rank}</span>
        <span className={`text-xl ${suitColor}`}>{suit}</span>
      </div>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl ${suitColor} opacity-20`}>{suit}</span>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className="flex flex-col items-center leading-none self-end rotate-180">
        <span className={`font-bold ${suitColor}`}>{rank}</span>
        <span className={`text-xl ${suitColor}`}>{suit}</span>
      </div>
    </div>
  )
}
