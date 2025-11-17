import { Card } from '@/game-logic/models/Card';

interface CommunityCardsProps {
  cards: Card[];
  pot: number;
}

export default function CommunityCards({ cards, pot }: CommunityCardsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pot Display */}
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-bold text-2xl shadow-2xl border-4 border-yellow-400 animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-3xl">💰</span>
          <span>${pot}</span>
        </div>
      </div>

      {/* Community Cards */}
      <div className="flex gap-3 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl shadow-2xl border-2 border-gray-700">
        {cards.map((card, i) => {
          // Validate card exists and has required properties
          if (!card || !card.rank || !card.suit) {
            console.error('Invalid card at index', i, card);
            return null;
          }

          // Highlight flop, turn, river differently
          const isFlop = i < 3;
          const isTurn = i === 3;
          const isRiver = i === 4;

          return (
            <div
              key={i}
              className={`bg-white rounded-xl p-4 shadow-2xl text-3xl font-bold transform hover:scale-110 transition-all duration-300 hover:-translate-y-2 ${
                isFlop ? 'animate-slideUp' : isTurn ? 'animate-slideUp border-4 border-orange-400' : isRiver ? 'animate-slideUp border-4 border-red-400' : ''
              }`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-black">{card.rank}</span>
                <span className={`text-4xl ${card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black'}`}>
                  {getSuitSymbol(card.suit)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Placeholder for unrevealed cards */}
        {Array.from({ length: 5 - cards.length }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 w-20 h-28 border-2 border-dashed border-gray-600 flex items-center justify-center opacity-40"
          >
            <span className="text-4xl text-gray-600">🂠</span>
          </div>
        ))}
      </div>

      {/* Card count indicator */}
      {cards.length > 0 && (
        <div className="text-gray-400 text-xs font-semibold">
          {cards.length === 3 && '🎴 Flop'}
          {cards.length === 4 && '🎴 Turn'}
          {cards.length === 5 && '🎴 River'}
        </div>
      )}
    </div>
  );
}

function getSuitSymbol(suit: string): string {
  return { h: '♥', d: '♦', c: '♣', s: '♠' }[suit] || suit;
}
