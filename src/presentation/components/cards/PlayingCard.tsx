import React from 'react';
import { Card } from '@/game-logic/models/Card';

interface PlayingCardProps {
  card: Card | null;
  faceDown?: boolean;
  className?: string;
}

const SUIT_SYMBOLS = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

const SUIT_COLORS = {
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
  s: 'text-gray-900',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({ card, faceDown = false, className = '' }) => {
  if (!card) {
    return <div className={`w-16 h-24 ${className}`} />;
  }

  if (faceDown) {
    return (
      <div
        className={`w-16 h-24 bg-blue-600 rounded-lg border-2 border-blue-800 flex items-center justify-center ${className}`}
      >
        <div className="text-white text-2xl">🂠</div>
      </div>
    );
  }

  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={`w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-md flex flex-col items-center justify-center ${className}`}
    >
      <div className={`text-2xl font-bold ${suitColor}`}>{card.rank}</div>
      <div className={`text-3xl ${suitColor}`}>{suitSymbol}</div>
    </div>
  );
};
