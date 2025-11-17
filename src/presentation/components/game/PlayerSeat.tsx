import React from 'react';
import { Player } from '@/game-logic/models/Player';
import { PlayingCard } from '../cards/PlayingCard';
import { PlayerStatus } from '@/utils/constants';

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  showCards?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentPlayer,
  showCards = false,
}) => {
  const isFolded = player.status === PlayerStatus.Folded;
  const isAllIn = player.status === PlayerStatus.AllIn;

  return (
    <div
      className={`relative p-4 rounded-lg ${
        isCurrentPlayer
          ? 'bg-yellow-500 ring-4 ring-yellow-300'
          : isFolded
          ? 'bg-gray-600 opacity-50'
          : 'bg-poker-green-dark'
      }`}
    >
      {/* Player info */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white">{player.name}</span>
          {player.isDealer && (
            <span className="ml-2 px-2 py-1 bg-white text-black text-xs rounded">D</span>
          )}
        </div>
        <div className="text-sm text-gray-200">Chips: ${player.chips}</div>
        {player.currentBet > 0 && (
          <div className="text-sm text-yellow-300">Bet: ${player.currentBet}</div>
        )}
        {isAllIn && <div className="text-sm text-red-400 font-bold">ALL-IN</div>}
      </div>

      {/* Cards */}
      {player.holeCards.length > 0 && (
        <div className="flex gap-1">
          {player.holeCards.map((card, idx) => (
            <PlayingCard
              key={idx}
              card={card}
              faceDown={!showCards && player.isBot}
              className="transform hover:scale-110 transition-transform"
            />
          ))}
        </div>
      )}

      {/* Position labels */}
      <div className="mt-2 text-xs text-gray-300">
        {player.isSmallBlind && <span className="mr-1">SB</span>}
        {player.isBigBlind && <span>BB</span>}
      </div>
    </div>
  );
};
