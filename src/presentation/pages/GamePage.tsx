import { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import type { pokerMachine } from '@/state-management/pokerMachine';
import type { GameSettings } from '@/types';
import { makeBotDecision, getBotActionDelay } from '@/bot-ai';
import { getActionDescription } from '@/utils/botActionService';
import { calculateHandStrength, calculatePreflopStrength } from '@/game-logic/handStrength';
import Hand from 'pokersolver';
import { cardToPokersolverFormat } from '@/utils/deck';

interface GamePageProps {
  state: ReturnType<typeof useMachine<typeof pokerMachine>>[0];
  send: ReturnType<typeof useMachine<typeof pokerMachine>>[1];
  settings: GameSettings;
}

export default function GamePage({ state, send, settings: _settings }: GamePageProps) {
  const context = state.context;
  const currentState = state.value;
  const [botActionMessage, setBotActionMessage] = useState<string>('');
  const [isProcessingBotAction, setIsProcessingBotAction] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [lastWinner, setLastWinner] = useState<{ name: string; handName: string } | null>(null);

  // Bot AI auto-play
  useEffect(() => {
    if (!state.matches('inGame') || isProcessingBotAction) return;

    const currentPlayer = context.players[context.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.type !== 'bot') return;

    // Bot's turn - execute bot action with delay
    setIsProcessingBotAction(true);

    const delay = getBotActionDelay(currentPlayer.botDifficulty || 'easy');

    const timeoutId = setTimeout(() => {
      try {
        const action = makeBotDecision({
          player: currentPlayer,
          allPlayers: context.players,
          communityCards: context.communityCards,
          currentBet: Math.max(...context.players.map(p => p.currentBet)),
          potSize: context.pot.totalPot,
          smallBlind: context.smallBlind,
          bigBlind: context.bigBlind,
          dealerIndex: context.dealerIndex,
          gamePhase: context.gamePhase,
        });

        // Show bot action message
        const message = getActionDescription(action, currentPlayer.name);
        setBotActionMessage(message);
        setActionHistory(prev => [...prev.slice(-9), message]);

        // Send action to state machine
        send({ type: 'PLAYER_ACTION', action });

        // Clear message after 1.5 seconds
        setTimeout(() => {
          setBotActionMessage('');
          setIsProcessingBotAction(false);
        }, 1500);
      } catch (error) {
        console.error('Bot action error:', error);
        setIsProcessingBotAction(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [context.currentPlayerIndex, context.players, state, send, context, isProcessingBotAction]);

  // Automatic phase progression
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Auto-advance from postingBlinds to preflop after brief delay
    if (state.matches({ inGame: 'postingBlinds' })) {
      timer = setTimeout(() => {
        send({ type: 'ADVANCE_PHASE' });
      }, 1500);
    }
    // Auto-complete hand after showdown
    else if (state.matches({ inGame: 'showdown' })) {
      // Determine winner for display
      const activePlayers = context.players.filter(p => !p.isFolded);
      if (activePlayers.length > 1 && context.communityCards.length >= 3) {
        try {
          const communityCardsStr = context.communityCards.map(cardToPokersolverFormat);
          const playerHands = activePlayers.map((player) => {
            const holeCardsStr = player.holeCards.map(cardToPokersolverFormat);
            const allCards = [...holeCardsStr, ...communityCardsStr];
            return {
              player,
              hand: Hand.solve(allCards),
            };
          });
          const hands = playerHands.map((ph) => ph.hand);
          const winningHands = Hand.winners(hands);
          const winners = playerHands.filter((ph) => winningHands.includes(ph.hand));

          if (winners.length > 0 && winners[0]) {
            setLastWinner({
              name: winners[0].player.name,
              handName: winners[0].hand.descr || winners[0].hand.name,
            });
          }
        } catch (error) {
          console.error('Error determining winner:', error);
        }
      } else if (activePlayers.length === 1 && activePlayers[0]) {
        setLastWinner({
          name: activePlayers[0].name,
          handName: 'Everyone else folded',
        });
      }

      timer = setTimeout(() => {
        send({ type: 'COMPLETE_HAND' });
        setActionHistory([]);
      }, 4000);
    }
    // Try to advance phase after each action (guards will prevent if not ready)
    else if (
      !isProcessingBotAction &&
      (state.matches({ inGame: 'preflop' }) ||
        state.matches({ inGame: 'flop' }) ||
        state.matches({ inGame: 'turn' }) ||
        state.matches({ inGame: 'river' }))
    ) {
      timer = setTimeout(() => {
        send({ type: 'ADVANCE_PHASE' });
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, isProcessingBotAction, send, context.players, context.communityCards]);

  // Reset action history on new hand
  useEffect(() => {
    if (state.matches({ inGame: 'postingBlinds' })) {
      setActionHistory([]);
      setLastWinner(null);
    }
  }, [state]);

  const currentPlayer = context.players[context.currentPlayerIndex];
  const isHumanTurn = currentPlayer?.type === 'human';
  const currentBet = Math.max(...context.players.map(p => p.currentBet), 0);
  const callAmount = currentBet - (currentPlayer?.currentBet || 0);
  const canCheck = callAmount === 0;

  // Calculate hand strength for human player
  const humanPlayer = context.players.find(p => p.type === 'human');
  let handStrength = 0;
  let handStrengthLabel = '';

  if (humanPlayer && humanPlayer.holeCards.length === 2) {
    if (context.communityCards.length >= 3) {
      handStrength = calculateHandStrength(humanPlayer.holeCards, context.communityCards);
    } else {
      handStrength = calculatePreflopStrength(humanPlayer.holeCards);
    }

    if (handStrength >= 0.8) handStrengthLabel = 'Premium';
    else if (handStrength >= 0.6) handStrengthLabel = 'Strong';
    else if (handStrength >= 0.4) handStrengthLabel = 'Medium';
    else if (handStrength >= 0.2) handStrengthLabel = 'Weak';
    else handStrengthLabel = 'Very Weak';
  }

  // Initialize raise amount to minimum raise
  useEffect(() => {
    if (currentPlayer && isHumanTurn) {
      const minRaise = callAmount + context.bigBlind;
      setRaiseAmount(Math.min(minRaise, currentPlayer.chips));
    }
  }, [currentPlayer, isHumanTurn, callAmount, context.bigBlind]);

  // Get phase label
  const getPhaseLabel = () => {
    if (state.matches({ inGame: 'postingBlinds' })) return 'Posting Blinds';
    if (state.matches({ inGame: 'preflop' })) return 'Pre-Flop';
    if (state.matches({ inGame: 'flop' })) return 'Flop';
    if (state.matches({ inGame: 'turn' })) return 'Turn';
    if (state.matches({ inGame: 'river' })) return 'River';
    if (state.matches({ inGame: 'showdown' })) return 'Showdown';
    return '';
  };

  // Position players in a circle (for better visual layout)
  const getPlayerPosition = (index: number, total: number) => {
    if (total === 2) {
      // Heads-up: human at bottom, bot at top
      return index === 0 ? 'bottom' : 'top';
    }
    if (total === 3) {
      // 3 players: human at bottom, bots at top-left and top-right
      if (index === 0) return 'bottom';
      if (index === 1) return 'top-left';
      return 'top-right';
    }
    if (total === 4) {
      // 4 players: human at bottom, bots on left, top, right
      if (index === 0) return 'bottom';
      if (index === 1) return 'left';
      if (index === 2) return 'top';
      return 'right';
    }
    // For 5+ players
    if (index === 0) return 'bottom';
    if (index === 1) return 'bottom-left';
    if (index === 2) return 'left';
    if (index === 3) return 'top-left';
    if (index === 4) return 'top';
    if (index === 5) return 'top-right';
    if (index === 6) return 'right';
    return 'bottom-right';
  };

  const getPositionClass = (position: string) => {
    const baseClass = 'absolute transition-all duration-300';
    switch (position) {
      case 'bottom': return `${baseClass} bottom-0 left-1/2 -translate-x-1/2`;
      case 'top': return `${baseClass} top-0 left-1/2 -translate-x-1/2`;
      case 'left': return `${baseClass} left-0 top-1/2 -translate-y-1/2`;
      case 'right': return `${baseClass} right-0 top-1/2 -translate-y-1/2`;
      case 'top-left': return `${baseClass} top-8 left-8`;
      case 'top-right': return `${baseClass} top-8 right-8`;
      case 'bottom-left': return `${baseClass} bottom-8 left-8`;
      case 'bottom-right': return `${baseClass} bottom-8 right-8`;
      default: return baseClass;
    }
  };

  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        {/* Dev Mode Toggle */}
        <button
          onClick={() => setDevMode(!devMode)}
          className="fixed top-4 right-4 bg-gray-800/90 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded z-50"
        >
          {devMode ? '🔧 Dev Mode: ON' : '🔧 Dev Mode: OFF'}
        </button>

        {/* Debug Info - Only show in dev mode */}
        {devMode && (
          <div className="bg-black/50 backdrop-blur rounded-lg p-4 mb-4 text-sm font-mono">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="text-gray-400">State:</span>{' '}
                <span className="text-green-400">{JSON.stringify(currentState)}</span>
              </div>
              <div>
                <span className="text-gray-400">Phase:</span>{' '}
                <span className="text-purple-400">{context.gamePhase || 'menu'}</span>
              </div>
              <div>
                <span className="text-gray-400">Players:</span>{' '}
                <span className="text-blue-400">{context.players.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Current Player:</span>{' '}
                <span className="text-yellow-400">{context.currentPlayerIndex}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bot Action Message */}
        {botActionMessage && (
          <div className="mb-4 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl inline-block shadow-lg animate-fade-in">
              💬 {botActionMessage}
            </div>
          </div>
        )}

        {/* Winner Announcement */}
        {lastWinner && state.matches({ inGame: 'showdown' }) && (
          <div className="mb-4 text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-8 rounded-xl inline-block shadow-2xl animate-bounce-in">
              <div className="text-2xl font-bold">🏆 {lastWinner.name} Wins!</div>
              <div className="text-sm mt-1">{lastWinner.handName}</div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {/* Action History Panel */}
          <div className="hidden lg:block w-64 bg-gray-900/90 backdrop-blur rounded-xl p-4 self-start sticky top-4">
            <h3 className="text-lg font-bold mb-3 text-white">📜 Action History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {actionHistory.length === 0 ? (
                <div className="text-gray-500 text-sm italic">No actions yet...</div>
              ) : (
                actionHistory.map((action, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-300 bg-gray-800/50 rounded px-2 py-1 animate-slide-in"
                  >
                    {action}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Poker Table */}
          <div className="flex-1">
            <div className="bg-felt-600 rounded-[3rem] border-8 border-gray-800 shadow-2xl p-8 md:p-12 relative min-h-[600px]">
              {/* Phase Label */}
              {getPhaseLabel() && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600/90 backdrop-blur px-6 py-2 rounded-full text-white font-bold text-lg shadow-lg">
                  {getPhaseLabel()}
                </div>
              )}

              {/* Community Cards Area */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl">
                {/* Community Cards */}
                <div className="flex justify-center gap-2 mb-6">
                  {context.communityCards.length > 0 ? (
                    context.communityCards.map((card, index) => (
                      <div
                        key={index}
                        className="w-14 h-20 md:w-16 md:h-24 bg-white rounded-lg shadow-xl flex flex-col items-center justify-center text-xl md:text-2xl font-bold border-2 border-gray-300 animate-card-deal"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                          {card.rank}
                        </span>
                        <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                          {card.suit}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/50 text-center py-8 text-sm">
                      {state.matches({ inGame: 'postingBlinds' })
                        ? 'Posting blinds...'
                        : 'Waiting for flop...'}
                    </div>
                  )}
                </div>

                {/* Pot Display */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 backdrop-blur rounded-2xl px-8 py-3 inline-block shadow-2xl border-4 border-yellow-500/50">
                    <div className="text-yellow-200 text-xs font-semibold mb-1">POT</div>
                    <div className="text-white font-bold text-2xl">${context.pot.totalPot}</div>
                  </div>
                </div>
              </div>

              {/* Players positioned around the table */}
              <div className="relative h-[600px]">
                {context.players.map((player, index) => {
                  const position = getPlayerPosition(index, context.players.length);
                  const isCurrentPlayer = index === context.currentPlayerIndex;
                  const isDealer = index === context.dealerIndex;

                  return (
                    <div
                      key={player.id}
                      className={`${getPositionClass(position)} w-48 md:w-56`}
                    >
                      <div
                        className={`bg-gray-800/95 backdrop-blur rounded-xl p-3 md:p-4 transition-all ${
                          isCurrentPlayer ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl' : 'shadow-lg'
                        } ${player.isFolded ? 'opacity-50 grayscale' : ''}`}
                      >
                        {/* Player Header */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            {/* Dealer Button */}
                            {isDealer && (
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-yellow-500">
                                D
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white text-sm md:text-base">
                                {player.name}
                              </div>
                              {player.type === 'bot' && player.botDifficulty && (
                                <div className="text-xs text-gray-400">
                                  {player.botDifficulty === 'easy' && '🤖 Easy'}
                                  {player.botDifficulty === 'medium' && '🤖 Medium'}
                                  {player.botDifficulty === 'hard' && '🤖 Hard'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-green-400 font-bold text-sm md:text-base">
                            ${player.chips}
                          </div>
                        </div>

                        {/* Hole Cards */}
                        {player.holeCards.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {player.holeCards.map((card, cardIndex) => (
                              <div
                                key={cardIndex}
                                className="w-10 h-14 md:w-12 md:h-16 rounded shadow-md flex items-center justify-center text-xs md:text-sm font-bold"
                              >
                                {player.type === 'human' ? (
                                  <div className="w-full h-full bg-white rounded flex flex-col items-center justify-center border-2 border-gray-300">
                                    <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                                      {card.rank}
                                    </span>
                                    <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                                      {card.suit}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center text-white border-2 border-blue-500">
                                    <div className="text-xs">🂠</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Player Status */}
                        <div className="space-y-1 text-xs md:text-sm">
                          {player.isFolded && (
                            <div className="text-red-400 font-semibold">✗ Folded</div>
                          )}
                          {player.isAllIn && (
                            <div className="text-yellow-400 font-semibold animate-pulse">⬆ ALL IN!</div>
                          )}
                          {player.currentBet > 0 && !player.isFolded && (
                            <div className="text-blue-400">Bet: ${player.currentBet}</div>
                          )}
                          {isCurrentPlayer && !player.isFolded && !player.isAllIn && (
                            <div className="text-yellow-400 font-semibold animate-pulse">
                              {player.type === 'human' ? '👉 Your turn' : '🤔 Thinking...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Game Over Screen */}
              {state.matches('gameOver') && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center rounded-[3rem] z-10">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md text-center shadow-2xl border-2 border-gray-700">
                    <h2 className="text-4xl font-bold mb-4 text-white">🎰 Game Over</h2>
                    <p className="text-gray-300 mb-6 text-lg">
                      {context.players[0]?.chips ?? 0 > 0
                        ? '🎉 Congratulations! You won!'
                        : '😔 Better luck next time!'}
                    </p>
                    <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
                      <div className="text-lg font-semibold mb-3 text-yellow-400">🏆 Final Standings</div>
                      {[...context.players]
                        .sort((a, b) => b.chips - a.chips)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex justify-between py-2 px-3 rounded ${
                              index === 0 ? 'bg-yellow-600/20 border border-yellow-600/50' : ''
                            }`}
                          >
                            <span className="text-white">
                              {index === 0 && '🥇 '}
                              {index === 1 && '🥈 '}
                              {index === 2 && '🥉 '}
                              {index + 1}. {player.name}
                            </span>
                            <span className="text-green-400 font-bold">${player.chips}</span>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => send({ type: 'RESET_GAME' })}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      Return to Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Below the table */}
            {state.matches('inGame') && isHumanTurn && currentPlayer && !state.matches({ inGame: 'showdown' }) && (
              <div className="mt-6 bg-gray-900/90 backdrop-blur rounded-2xl p-6">
                {/* Hand Strength Indicator */}
                {handStrengthLabel && (
                  <div className="mb-4 text-center">
                    <div className="inline-block bg-gray-800 rounded-lg px-4 py-2">
                      <span className="text-gray-400 text-sm mr-2">Hand Strength:</span>
                      <span className={`font-bold ${
                        handStrength >= 0.8 ? 'text-green-400' :
                        handStrength >= 0.6 ? 'text-blue-400' :
                        handStrength >= 0.4 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {handStrengthLabel}
                      </span>
                      <div className="mt-2 w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            handStrength >= 0.8 ? 'bg-green-500' :
                            handStrength >= 0.6 ? 'bg-blue-500' :
                            handStrength >= 0.4 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${handStrength * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                  {/* Fold Button */}
                  <button
                    onClick={() =>
                      send({
                        type: 'PLAYER_ACTION',
                        action: {
                          playerId: currentPlayer.id,
                          type: 'fold',
                          amount: 0,
                          timestamp: Date.now(),
                        },
                      })
                    }
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Fold
                  </button>

                  {/* Check Button */}
                  {canCheck && (
                    <button
                      onClick={() =>
                        send({
                          type: 'PLAYER_ACTION',
                          action: {
                            playerId: currentPlayer.id,
                            type: 'check',
                            amount: 0,
                            timestamp: Date.now(),
                          },
                        })
                      }
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      Check
                    </button>
                  )}

                  {/* Call Button */}
                  {!canCheck && (
                    <button
                      onClick={() =>
                        send({
                          type: 'PLAYER_ACTION',
                          action: {
                            playerId: currentPlayer.id,
                            type: 'call',
                            amount: Math.min(callAmount, currentPlayer.chips),
                            timestamp: Date.now(),
                          },
                        })
                      }
                      disabled={currentPlayer.chips === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 md:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      Call ${Math.min(callAmount, currentPlayer.chips)}
                    </button>
                  )}

                  {/* Raise Button with Slider */}
                  {currentPlayer.chips > callAmount && (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => {
                          send({
                            type: 'PLAYER_ACTION',
                            action: {
                              playerId: currentPlayer.id,
                              type: raiseAmount >= currentPlayer.chips ? 'all-in' : 'raise',
                              amount: raiseAmount,
                              timestamp: Date.now(),
                            },
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                        Raise ${raiseAmount}
                      </button>
                      <input
                        type="range"
                        min={Math.min(callAmount + context.bigBlind, currentPlayer.chips)}
                        max={currentPlayer.chips}
                        step={context.bigBlind}
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>
                  )}

                  {/* All-In Button */}
                  <button
                    onClick={() =>
                      send({
                        type: 'PLAYER_ACTION',
                        action: {
                          playerId: currentPlayer.id,
                          type: 'all-in',
                          amount: currentPlayer.chips,
                          timestamp: Date.now(),
                        },
                      })
                    }
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    All-In ${currentPlayer.chips}
                  </button>
                </div>
              </div>
            )}

            {/* Debug Actions - Only in dev mode */}
            {devMode && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => send({ type: 'ADVANCE_PHASE' })}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Advance Phase
                </button>
                <button
                  onClick={() => send({ type: 'END_GAME' })}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  End Game
                </button>
              </div>
            )}
          </div>

          {/* Game Info Panel */}
          <div className="hidden xl:block w-64 bg-gray-900/90 backdrop-blur rounded-xl p-4 self-start sticky top-4">
            <h3 className="text-lg font-bold mb-3 text-white">ℹ️ Game Info</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Small Blind</div>
                <div className="text-white font-bold">${context.smallBlind}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Big Blind</div>
                <div className="text-white font-bold">${context.bigBlind}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Current Bet</div>
                <div className="text-white font-bold">${currentBet}</div>
              </div>
              {isHumanTurn && callAmount > 0 && (
                <div className="bg-blue-900/50 rounded p-2 border border-blue-500/50">
                  <div className="text-blue-300">To Call</div>
                  <div className="text-white font-bold">${callAmount}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
