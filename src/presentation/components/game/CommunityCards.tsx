import type { Card } from '@/types';
import { motion } from 'framer-motion';
import { PlayingCard } from '../cards/PlayingCard';

interface CommunityCardsProps {
  cards: Card[];
}

export function CommunityCards({ cards }: CommunityCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="flex gap-2 justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-16 h-24 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="flex gap-2 justify-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <PlayingCard card={card} size="md" />
        </motion.div>
      ))}
      {/* Empty placeholders for remaining cards */}
      {[...Array(5 - cards.length)].map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-16 h-24 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600"
        />
      ))}
    </motion.div>
  );
}
