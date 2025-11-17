import type { PotStructure } from '@/types';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

interface PotDisplayProps {
  pot: PotStructure;
}

export function PotDisplay({ pot }: PotDisplayProps) {
  return (
    <motion.div
      className="bg-black/60 px-6 py-3 rounded-full border-2 border-yellow-500/50"
      animate={pot.totalPot > 0 ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Coins className="w-6 h-6 text-yellow-400" />
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase">Pot</p>
          <p className="text-2xl font-bold text-yellow-400">
            ${pot.totalPot.toLocaleString()}
          </p>
        </div>
      </div>

      {pot.sidePots.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">Main: ${pot.mainPot}</p>
          {pot.sidePots.map((sidePot, idx) => (
            <p key={idx} className="text-xs text-gray-400">
              Side {idx + 1}: ${sidePot.amount}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
