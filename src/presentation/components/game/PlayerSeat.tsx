import type { Player } from '@/types';
import { PlayingCard } from '../cards/PlayingCard';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  isHuman: boolean;
}

export function PlayerSeat({ player, isCurrentPlayer, isHuman }: PlayerSeatProps) {
  const isActive = player.status === 'active';
  const isFolded = player.status === 'folded';

  return (
    <motion.div
      className={`relative bg-gray-800/90 rounded-lg p-3 min-w-[180px] border-2 transition-all ${
        isCurrentPlayer && isActive
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
          : 'border-gray-700'
      } ${isFolded ? 'opacity-50' : ''}`}
      animate={isCurrentPlayer && isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      {/* Player Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0">
          {isHuman ? (
            <User className="w-6 h-6 text-blue-400" />
          ) : (
            <Bot className="w-6 h-6 text-purple-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{player.name}</p>
          <p className="text-sm text-gray-400">
            ${player.chips.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Hole Cards */}
      {player.holeCards.length > 0 && (
        <div className="flex gap-1 mb-2">
          {player.holeCards.map((card, idx) => (
            <div key={`${card.id}-${idx}`} className="flex-1">
              {isHuman ? (
                <PlayingCard card={card} size="sm" />
              ) : (
                <div className="card-back w-full h-16" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Current Bet */}
      {player.currentBet > 0 && (
        <div className="bg-green-600/20 border border-green-500 rounded px-2 py-1">
          <p className="text-xs text-green-400 font-bold">
            Bet: ${player.currentBet}
          </p>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex gap-1 mt-2">
        {player.isDealer && (
          <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">
            D
          </span>
        )}
        {player.isSmallBlind && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-bold">
            SB
          </span>
        )}
        {player.isBigBlind && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
            BB
          </span>
        )}
        {player.status === 'all-in' && (
          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded font-bold">
            ALL-IN
          </span>
        )}
      </div>

      {/* Thinking Indicator for Active Bot */}
      {isCurrentPlayer && !isHuman && isActive && (
        <div className="absolute -top-2 -right-2">
          <motion.div
            className="bg-blue-500 rounded-full p-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-white text-xs font-bold">...</span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
