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
    handNumber,
    settings,
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
      return { winners: [], allHands: new Map() };
    }

    const gameState = useGameStore.getState();
    const playersInHand = getPlayersInHand(gameState);

    if (playersInHand.length === 0) {
      return { winners: [], allHands: new Map() };
    }

    const allHands = new Map();

    // Evaluate all hands first
    for (const player of playersInHand) {
      if (player.holeCards.length === 2 && communityCards.length >= 3) {
        try {
          const allCards = [...player.holeCards, ...communityCards];
          const handResult = handEvaluator.evaluateHand(allCards);
          allHands.set(player.id, {
            rank: HAND_RANK_NAMES[handResult.rank],
            description: handResult.description,
          });
        } catch (e) {
          // Ignore
        }
      }
    }

    // Find winners
    if (playersInHand.length === 1) {
      return { winners: [playersInHand[0].id], allHands };
    }

    const playerHands = playersInHand.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...communityCards],
    }));

    const winners = handEvaluator.findWinners(playerHands);

    return { winners, allHands };
  }, [phase, players, communityCards]);

  const { winners, allHands } = showdownInfo;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-800 to-green-900 p-8">
      {/* Game Info Header */}
      <div className="mb-4 flex gap-4 text-white">
        <div className="rounded-lg bg-black/40 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-white/70">Hand #</span>
          <span className="ml-2 font-bold">{handNumber}</span>
        </div>
        <div className="rounded-lg bg-black/40 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-white/70">Blinds</span>
          <span className="ml-2 font-bold">${settings.smallBlind}/${settings.bigBlind}</span>
        </div>
        <div className="rounded-lg bg-black/40 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-white/70">Players</span>
          <span className="ml-2 font-bold">{players.filter(p => p.status !== 'eliminated').length}/{players.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="relative flex h-[600px] w-[900px] items-center justify-center rounded-full border-8 border-green-700 bg-gradient-to-br from-green-600 to-green-700 shadow-2xl">
        {/* Center - Community Cards and Info */}
        <div className="absolute flex flex-col items-center gap-3">
          {/* Phase Indicator */}
          <div className="rounded-lg bg-black/40 px-4 py-2 text-center backdrop-blur-sm">
            <div className="text-sm font-bold text-yellow-300">{phaseNames[phase]}</div>
          </div>

          {/* Community Cards */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {communityCards.length === 0 && phase !== 'waiting' && phase !== 'complete' && (
                <div className="text-lg text-white/80">Dealing...</div>
              )}
              {communityCards.map((card, i) => (
                <PlayingCard
                  key={`community-${i}-${card.rank}${card.suit}`}
                  card={card}
                  className="shadow-xl"
                />
              ))}
            </div>
            {/* Community Cards Label */}
            {communityCards.length > 0 && (
              <div className="text-xs text-white/60">
                {phase === 'flop' && communityCards.length === 3 && 'Flop'}
                {phase === 'turn' && communityCards.length === 4 && 'Turn'}
                {phase === 'river' && communityCards.length === 5 && 'River'}
                {(phase === 'showdown' || phase === 'complete') && communityCards.length === 5 && 'Board'}
              </div>
            )}
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
              {winners.length === 1 && allHands.has(winners[0]) && (
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  {allHands.get(winners[0])?.rank}
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
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  {player.holeCards.length > 0 && (
                    <>
                      {/* Show cards if: human player, OR showdown/complete phase and player didn't fold */}
                      {(isHuman || ((phase === 'showdown' || phase === 'complete') && player.status !== 'folded')) ? (
                        player.holeCards.map((card, i) => (
                          <PlayingCard
                            key={`${player.id}-${i}-${card.rank}${card.suit}`}
                            card={card}
                            className={isWinner ? 'ring-2 ring-green-400' : ''}
                            animate={isHuman ? true : false}
                          />
                        ))
                      ) : (
                        <>
                          <PlayingCard faceDown animate={false} />
                          <PlayingCard faceDown animate={false} />
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Hand Rank at Showdown */}
                {(phase === 'showdown' || phase === 'complete') && allHands.has(player.id) && player.status !== 'folded' && (
                  <div className={cn(
                    'rounded-lg px-3 py-1 text-xs font-bold shadow-md',
                    isWinner ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                  )}>
                    {allHands.get(player.id)?.rank}
                  </div>
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
