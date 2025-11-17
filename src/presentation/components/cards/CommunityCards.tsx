import { Card } from '@/game-logic/models/Card';

interface CommunityCardsProps {
  cards: Card[];
  pot: number;
}

export default function CommunityCards({ cards, pot }: CommunityCardsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pot */}
      <div className="bg-gray-900 text-yellow-400 px-6 py-2 rounded-full font-bold text-xl shadow-lg">
        Pot: ${pot}
      </div>

      {/* Community Cards */}
      <div className="flex gap-2">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-lg text-2xl font-bold">
            {card.rank}
            <span className={card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black'}>
              {getSuitSymbol(card.suit)}
            </span>
          </div>
        ))}
        {/* Placeholder for unrevealed cards */}
        {Array.from({ length: 5 - cards.length }).map((_, i) => (
          <div key={`placeholder-${i}`} className="bg-gray-700 rounded-lg p-4 w-16 h-24 border-2 border-dashed border-gray-500"></div>
        ))}
      </div>
    </div>
  );
}

function getSuitSymbol(suit: string): string {
  return { h: '♥', d: '♦', c: '♣', s: '♠' }[suit] || suit;
}
