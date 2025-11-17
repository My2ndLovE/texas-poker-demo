import { Card as CardModel } from '../../game-logic/models/Card'
import { Card } from './Card'

interface CommunityCardsProps {
  cards: CardModel[]
  className?: string
}

export function CommunityCards({ cards, className = '' }: CommunityCardsProps) {
  // Pad to 5 cards (flop, turn, river)
  const paddedCards = [...cards, ...Array(5 - cards.length).fill(null)]

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Flop (first 3 cards) */}
      <div className="flex gap-2">
        {paddedCards.slice(0, 3).map((card, index) => (
          <Card key={`flop-${index}`} card={card} size="large" />
        ))}
      </div>

      {/* Divider */}
      {cards.length >= 3 && (
        <div className="w-px bg-white/20 mx-2"></div>
      )}

      {/* Turn (4th card) */}
      {paddedCards[3] !== null && (
        <Card card={paddedCards[3]} size="large" />
      )}

      {/* Divider */}
      {cards.length >= 4 && (
        <div className="w-px bg-white/20 mx-2"></div>
      )}

      {/* River (5th card) */}
      {paddedCards[4] !== null && (
        <Card card={paddedCards[4]} size="large" />
      )}
    </div>
  )
}
