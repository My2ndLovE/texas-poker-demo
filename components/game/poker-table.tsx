'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { PlayingCard } from '../cards/playing-card';
import { ActionButtons } from './action-buttons';
import { cn } from '@/lib/utils/cn';
import { handEvaluator } from '@/lib/game-logic/evaluation/HandEvaluator';
import { HAND_RANK_NAMES } from '@/lib/game-logic/models/Hand';
import { getPlayersInHand } from '@/lib/game-logic/models/GameState';

export function PokerTable() {
  const {
    players,
    communityCards,
    pot,
    currentPlayerIndex,
    dealerIndex,
    phase,
    actionHistory,
    startNewHand,
  } = useGameStore();

  // Calculate total pot including current bets
  const currentBetsTotal = players.reduce((sum, p) => sum + p.currentBet, 0);
  const totalPot = pot.mainPot + pot.sidePots.reduce((sum, sp) => sum + sp.amount, 0) + currentBetsTotal;

  // Get human player and evaluate their hand (memoized)
  const humanPlayer = useMemo(() => players.find(p => !p.isBot), [players]);

  const humanHandStrength = useMemo(() => {
    if (!humanPlayer || humanPlayer.holeCards.length !== 2 || communityCards.length < 3) {
      return null;
    }
    try {
      const allCards = [...humanPlayer.holeCards, ...communityCards];
      const handResult = handEvaluator.evaluateHand(allCards);
      return {
        rank: HAND_RANK_NAMES[handResult.rank],
        description: handResult.description,
      };
    } catch (e) {
      return null;
    }
  }, [humanPlayer, communityCards]);

  // Get last action for display
  const lastAction = actionHistory.length > 0 ? actionHistory[actionHistory.length - 1] : null;
  const lastActionPlayer = lastAction ? players.find(p => p.id === lastAction.playerId) : null;

  // Phase display names
  const phaseNames: Record<string, string> = {
    waiting: 'Waiting',
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
    complete: 'Hand Complete',
  };

  // Determine winners and their hands at showdown (memoized)
  const showdownInfo = useMemo(() => {
    if (phase !== 'showdown' && phase !== 'complete') {
      return { winners: [], winnerHands: new Map() };
    }

    const gameState = useGameStore.getState();
    const playersInHand = getPlayersInHand(gameState);

    if (playersInHand.length === 0) {
      return { winners: [], winnerHands: new Map() };
    }

    if (playersInHand.length === 1) {
      const winner = playersInHand[0];
      const winnerHands = new Map();
      if (winner.holeCards.length === 2 && communityCards.length >= 3) {
        try {
          const allCards = [...winner.holeCards, ...communityCards];
          const handResult = handEvaluator.evaluateHand(allCards);
          winnerHands.set(winner.id, {
            rank: HAND_RANK_NAMES[handResult.rank],
            description: handResult.description,
          });
        } catch (e) {
          // Ignore
        }
      }
      return { winners: [winner.id], winnerHands };
    }

    // Multiple players - evaluate all hands
    const playerHands = playersInHand.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...communityCards],
    }));

    const winners = handEvaluator.findWinners(playerHands);
    const winnerHands = new Map();

    // Evaluate winner hands
    for (const winnerId of winners) {
      const player = players.find(p => p.id === winnerId);
      if (player && player.holeCards.length === 2) {
        try {
          const allCards = [...player.holeCards, ...communityCards];
          const handResult = handEvaluator.evaluateHand(allCards);
          winnerHands.set(winnerId, {
            rank: HAND_RANK_NAMES[handResult.rank],
            description: handResult.description,
          });
        } catch (e) {
          // Ignore
        }
      }
    }

    return { winners, winnerHands };
  }, [phase, players, communityCards]);

  const { winners, winnerHands } = showdownInfo;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-800 to-green-900 p-8">
      {/* Table */}
      <div className="relative flex h-[600px] w-[900px] items-center justify-center rounded-full border-8 border-green-700 bg-gradient-to-br from-green-600 to-green-700 shadow-2xl">
        {/* Center - Community Cards and Info */}
        <div className="absolute flex flex-col items-center gap-3">
          {/* Phase Indicator */}
          <div className="rounded-lg bg-black/40 px-4 py-2 text-center backdrop-blur-sm">
            <div className="text-sm font-bold text-yellow-300">{phaseNames[phase]}</div>
          </div>

          {/* Community Cards */}
          <div className="flex gap-2">
            {communityCards.length === 0 && phase !== 'waiting' && phase !== 'complete' && (
              <div className="text-lg text-white/80">Dealing...</div>
            )}
            {communityCards.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </div>

          {/* Pot Display */}
          <div className="rounded-lg bg-black/40 px-6 py-3 text-center backdrop-blur-sm">
            <div className="text-sm text-white/70">TOTAL POT</div>
            <div className="text-3xl font-bold text-yellow-400">${totalPot}</div>
            {pot.sidePots.length > 0 && (
              <div className="mt-1 text-xs text-white/60">
                Main: ${pot.mainPot} | Side: ${pot.sidePots.reduce((sum, sp) => sum + sp.amount, 0)}
              </div>
            )}
          </div>

          {/* Last Action */}
          {lastAction && lastActionPlayer && phase !== 'complete' && (
            <div className="rounded-lg bg-black/30 px-4 py-1 text-center">
              <div className="text-xs text-white/80">
                {lastActionPlayer.name}: <span className="font-bold text-yellow-300">{lastAction.type.toUpperCase()}</span>
                {lastAction.amount > 0 && <span> ${lastAction.amount}</span>}
              </div>
            </div>
          )}

          {/* Winner Announcement */}
          {(phase === 'showdown' || phase === 'complete') && winners.length > 0 && (
            <div className="animate-pulse rounded-lg bg-yellow-500/90 px-6 py-4 text-center shadow-xl">
              <div className="text-sm font-bold text-gray-900">
                {winners.length > 1 ? 'WINNERS' : 'WINNER'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {winners.map(wId => players.find(p => p.id === wId)?.name).join(', ')}
              </div>
              {winners.length === 1 && winnerHands.has(winners[0]) && (
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  {winnerHands.get(winners[0])?.rank}
                </div>
              )}
              {winners.length > 1 && (
                <div className="mt-1 text-xs text-gray-800">
                  Split Pot
                </div>
              )}
            </div>
          )}
        </div>

        {/* Players */}
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isDealer = index === dealerIndex;
          const isHuman = !player.isBot;
          const isWinner = winners.includes(player.id);
          const isEliminated = player.status === 'eliminated';

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
                isHuman && 'bottom-4',
                isEliminated && 'opacity-40'
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
              {/* Dealer Button */}
              {isDealer && !isEliminated && (
                <div className="absolute -right-8 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900 shadow-lg ring-2 ring-yellow-400">
                  D
                </div>
              )}

              {/* Player Info */}
              <div
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-lg p-3 text-white shadow-lg transition-all',
                  isEliminated ? 'bg-gray-700' : 'bg-gray-800',
                  isCurrentPlayer && !isEliminated && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-700',
                  isWinner && 'ring-4 ring-green-400 ring-offset-2 ring-offset-green-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('text-sm font-bold', isHuman && 'text-blue-300')}>
                    {player.name}
                    {isHuman && ' (You)'}
                  </div>
                </div>

                {/* Bot Difficulty Badge */}
                {player.isBot && player.botDifficulty && !isEliminated && (
                  <div className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    player.botDifficulty === 'easy' && 'bg-green-600',
                    player.botDifficulty === 'medium' && 'bg-yellow-600',
                    player.botDifficulty === 'hard' && 'bg-red-600'
                  )}>
                    {player.botDifficulty.toUpperCase()}
                  </div>
                )}

                <div className={cn(
                  'text-lg font-bold',
                  isEliminated ? 'text-gray-500' : 'text-green-400'
                )}>
                  ${player.chips}
                </div>

                {player.currentBet > 0 && (
                  <div className="rounded bg-black/30 px-2 py-1 text-sm font-bold text-yellow-400">
                    Bet: ${player.currentBet}
                  </div>
                )}

                {player.status === 'folded' && (
                  <div className="text-xs font-bold text-red-400">FOLDED</div>
                )}
                {player.status === 'all-in' && (
                  <div className="text-xs font-bold text-purple-400">ALL-IN</div>
                )}
                {player.status === 'eliminated' && (
                  <div className="text-xs font-bold text-gray-500">ELIMINATED</div>
                )}

                {isWinner && (phase === 'showdown' || phase === 'complete') && (
                  <div className="text-xs font-bold text-green-400">🏆 WINNER</div>
                )}
              </div>

              {/* Hole Cards */}
              <div className="flex gap-1">
                {player.holeCards.length > 0 && (
                  <>
                    {/* Show cards if: human player, OR showdown/complete phase and player didn't fold */}
                    {(isHuman || ((phase === 'showdown' || phase === 'complete') && player.status !== 'folded')) ? (
                      player.holeCards.map((card, i) => (
                        <PlayingCard
                          key={i}
                          card={card}
                          className={isWinner ? 'ring-2 ring-green-400' : ''}
                        />
                      ))
                    ) : (
                      <>
                        <PlayingCard faceDown />
                        <PlayingCard faceDown />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Human Player Hand Strength */}
      {humanHandStrength && humanPlayer && phase !== 'showdown' && phase !== 'complete' && (
        <div className="mt-4 rounded-lg bg-black/40 px-6 py-3 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-white/70">Your Hand</div>
            <div className="text-lg font-bold text-yellow-300">{humanHandStrength.rank}</div>
            <div className="text-xs text-white/60">{humanHandStrength.description}</div>
          </div>
        </div>
      )}

      {/* Next Hand Button at Showdown */}
      {phase === 'complete' && (
        <div className="mt-6">
          <button
            onClick={startNewHand}
            className="rounded-lg bg-green-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-green-700 hover:scale-105"
          >
            Next Hand
          </button>
        </div>
      )}

      {/* Action Buttons for Human Player */}
      {phase !== 'complete' && phase !== 'showdown' && (
        <div className="mt-4">
          <ActionButtons />
        </div>
      )}
    </div>
  );
}
