'use client';

import { motion } from 'framer-motion';
import { Card, SUIT_SYMBOLS, RANK_NAMES } from '@/lib/game-logic/models/Card';
import { cn } from '@/lib/utils/cn';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  className?: string;
  animate?: boolean;
}

export function PlayingCard({ card, faceDown = false, className, animate = true }: PlayingCardProps) {
  const cardContent = faceDown || !card ? (
    <div
      className={cn(
        'flex h-24 w-16 items-center justify-center rounded-lg border-2 border-gray-400 bg-gradient-to-br from-blue-800 to-blue-900 text-4xl text-white shadow-lg',
        className
      )}
    >
      🂠
    </div>
  ) : (
    <div
      className={cn(
        'flex h-24 w-16 flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-1 shadow-lg',
        className
      )}
    >
      <div className={cn('text-2xl font-bold', card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black')}>
        {card.rank}
      </div>
      <div className={cn('text-3xl', card.suit === 'h' || card.suit === 'd' ? 'text-red-600' : 'text-black')}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
    </div>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.3,
      }}
    >
      {cardContent}
    </motion.div>
  );
}
