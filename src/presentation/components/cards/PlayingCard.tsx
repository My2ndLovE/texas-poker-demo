import type { Card } from '@/types';
import { motion } from 'framer-motion';

interface PlayingCardProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}

export function PlayingCard({ card, size = 'md', faceDown = false }: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base',
  };

  if (faceDown) {
    return (
      <motion.div
        className={`card-back ${sizeClasses[size]}`}
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 0.3 }}
      />
    );
  }

  const isRed = card.suit === 'h' || card.suit === 'd';
  const suitSymbols: Record<string, string> = {
    h: '♥',
    d: '♦',
    c: '♣',
    s: '♠',
  };

  const rankDisplay: Record<string, string> = {
    T: '10',
    J: 'J',
    Q: 'Q',
    K: 'K',
    A: 'A',
  };

  const displayRank = rankDisplay[card.rank] || card.rank;

  return (
    <motion.div
      className={`playing-card ${sizeClasses[size]} flex flex-col items-center justify-between p-1 ${
        isRed ? 'text-red-600' : 'text-gray-900'
      }`}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top-left rank and suit */}
      <div className="text-left w-full">
        <div className="font-bold leading-none">{displayRank}</div>
        <div className="text-xl leading-none">{suitSymbols[card.suit]}</div>
      </div>

      {/* Center suit (large) */}
      <div className="text-4xl">{suitSymbols[card.suit]}</div>

      {/* Bottom-right rank and suit (upside down) */}
      <div className="text-right w-full transform rotate-180">
        <div className="font-bold leading-none">{displayRank}</div>
        <div className="text-xl leading-none">{suitSymbols[card.suit]}</div>
      </div>
    </motion.div>
  );
}
