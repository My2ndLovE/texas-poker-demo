'use client';

import { useGameStore } from '@/lib/stores/game-store';
import { PlayingCard } from '../cards/playing-card';
import { ActionButtons } from './action-buttons';
import { cn } from '@/lib/utils/cn';

export function PokerTable() {
  const {
    players,
    communityCards,
    pot,
    currentPlayerIndex,
    dealerIndex,
    phase,
  } = useGameStore();

  const totalPot = pot.mainPot + pot.sidePots.reduce((sum, sp) => sum + sp.amount, 0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-800 to-green-900 p-8">
      {/* Table */}
      <div className="relative flex h-[600px] w-[900px] items-center justify-center rounded-full border-8 border-green-700 bg-gradient-to-br from-green-600 to-green-700 shadow-2xl">
        {/* Center - Community Cards */}
        <div className="absolute flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {communityCards.length === 0 && phase !== 'waiting' && (
              <div className="text-white">Dealing...</div>
            )}
            {communityCards.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </div>

          {/* Pot */}
          <div className="rounded-lg bg-black/30 px-6 py-3 text-center">
            <div className="text-sm text-white/70">POT</div>
            <div className="text-2xl font-bold text-yellow-400">${totalPot}</div>
          </div>
        </div>

        {/* Players */}
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isDealer = index === dealerIndex;
          const isHuman = !player.isBot;

          // Position players around table
          const angle = (index / players.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 230;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={player.id}
              className={cn(
                'absolute flex flex-col items-center gap-2',
                isHuman && 'bottom-4'
              )}
              style={
                isHuman
                  ? { left: '50%', transform: 'translateX(-50%)' }
                  : {
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }
              }
            >
              {/* Player Info */}
              <div
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg bg-gray-800 p-3 text-white shadow-lg',
                  isCurrentPlayer && 'ring-4 ring-yellow-400'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold">{player.name}</div>
                  {isDealer && <div className="text-xs">(D)</div>}
                </div>
                <div className="text-lg font-bold text-green-400">${player.chips}</div>
                {player.currentBet > 0 && (
                  <div className="text-sm text-yellow-400">Bet: ${player.currentBet}</div>
                )}
                {player.status !== 'active' && (
                  <div className="text-xs text-red-400">{player.status.toUpperCase()}</div>
                )}
              </div>

              {/* Hole Cards */}
              <div className="flex gap-1">
                {isHuman && player.holeCards.length > 0 ? (
                  player.holeCards.map((card, i) => <PlayingCard key={i} card={card} />)
                ) : (
                  player.holeCards.length > 0 && (
                    <>
                      <PlayingCard faceDown />
                      <PlayingCard faceDown />
                    </>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons for Human Player */}
      <div className="mt-8">
        <ActionButtons />
      </div>
    </div>
  );
}
