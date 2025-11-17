'use client';

import { Card, SUIT_SYMBOLS, RANK_NAMES } from '@/lib/game-logic/models/Card';
import { cn } from '@/lib/utils/cn';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  className?: string;
}

export function PlayingCard({ card, faceDown = false, className }: PlayingCardProps) {
  if (faceDown || !card) {
    return (
      <div
        className={cn(
          'flex h-24 w-16 items-center justify-center rounded-lg border-2 border-gray-400 bg-gradient-to-br from-blue-800 to-blue-900 text-4xl text-white shadow-lg',
          className
        )}
      >
        🂠
      </div>
    );
  }

  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div
      className={cn(
        'flex h-24 w-16 flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-1 shadow-lg',
        className
      )}
    >
      <div className={cn('text-2xl font-bold', isRed ? 'text-red-600' : 'text-black')}>
        {card.rank}
      </div>
      <div className={cn('text-3xl', isRed ? 'text-red-600' : 'text-black')}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
    </div>
  );
}
