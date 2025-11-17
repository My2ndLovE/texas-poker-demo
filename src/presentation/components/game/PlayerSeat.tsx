import React from 'react';
import { Player } from '@/game-logic/models/Player';
import { PlayingCard } from '../cards/PlayingCard';
import { PlayerStatus, GamePhase } from '@/utils/constants';

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  showCards?: boolean;
  gamePhase?: GamePhase;
  lastAction?: {
    type: string;
    amount?: number;
  };
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentPlayer,
  showCards = false,
  gamePhase,
  lastAction,
}) => {
  const isFolded = player.status === PlayerStatus.Folded;
  const isAllIn = player.status === PlayerStatus.AllIn;
  const isShowdown = gamePhase === GamePhase.Showdown || gamePhase === GamePhase.HandComplete;

  // At showdown, show all non-folded players' cards
  const shouldShowCards = showCards || (isShowdown && !isFolded);

  const getActionDisplay = () => {
    if (!lastAction) return null;

    const actionColors: Record<string, string> = {
      fold: 'bg-red-600',
      call: 'bg-blue-600',
      check: 'bg-green-600',
      bet: 'bg-purple-600',
      raise: 'bg-yellow-600',
      'all-in': 'bg-red-700',
    };

    const actionText = lastAction.type === 'raise' || lastAction.type === 'bet'
      ? `${lastAction.type.toUpperCase()} $${lastAction.amount}`
      : lastAction.type.toUpperCase();

    return (
      <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-bold text-white rounded ${actionColors[lastAction.type.toLowerCase()] || 'bg-gray-600'} shadow-lg z-10`}>
        {actionText}
      </div>
    );
  };

  return (
    <div
      className={`relative p-4 rounded-lg transition-all duration-300 ${
        isCurrentPlayer
          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 ring-4 ring-yellow-300 shadow-2xl shadow-yellow-500/50 animate-pulse'
          : isFolded
          ? 'bg-gray-700 opacity-40'
          : 'bg-gradient-to-br from-poker-green-dark to-green-900 shadow-lg'
      }`}
    >
      {/* Current Turn Indicator */}
      {isCurrentPlayer && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          {player.isBot ? 'THINKING...' : '✨ YOUR TURN ✨'}
        </div>
      )}

      {/* Last Action Badge */}
      {lastAction && getActionDisplay()}

      {/* Player info */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-bold ${isCurrentPlayer ? 'text-black' : 'text-white'} text-lg`}>
            {player.name}
          </span>

          {/* Position Badges */}
          <div className="flex gap-1">
            {player.isDealer && (
              <span className="px-2 py-1 bg-white text-black text-xs font-bold rounded-full shadow border-2 border-yellow-400">
                D
              </span>
            )}
            {player.isSmallBlind && (
              <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full shadow">
                SB
              </span>
            )}
            {player.isBigBlind && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                BB
              </span>
            )}
          </div>
        </div>

        {/* Chips Display */}
        <div className={`text-sm font-semibold ${isCurrentPlayer ? 'text-black' : 'text-green-300'} flex items-center gap-1`}>
          <span className="text-lg">💰</span>
          <span>${player.chips.toLocaleString()}</span>
        </div>

        {/* Current Bet */}
        {player.currentBet > 0 && (
          <div className={`text-sm font-bold ${isCurrentPlayer ? 'text-black' : 'text-yellow-300'} flex items-center gap-1 mt-1`}>
            <span>🪙</span>
            <span>Bet: ${player.currentBet}</span>
          </div>
        )}

        {/* All-In Badge */}
        {isAllIn && (
          <div className="mt-2 px-2 py-1 bg-red-600 text-white text-sm font-bold rounded text-center animate-pulse">
            ALL-IN!
          </div>
        )}

        {/* Folded Badge */}
        {isFolded && (
          <div className="mt-2 px-2 py-1 bg-gray-500 text-white text-sm font-bold rounded text-center">
            FOLDED
          </div>
        )}
      </div>

      {/* Cards */}
      {player.holeCards.length > 0 && (
        <div className="flex gap-1 justify-center">
          {player.holeCards.map((card, idx) => (
            <PlayingCard
              key={idx}
              card={card}
              faceDown={!shouldShowCards && player.isBot}
              className="transform hover:scale-110 transition-transform duration-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};
