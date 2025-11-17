import { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import type { pokerMachine } from '@/state-management/pokerMachine';
import type { GameSettings } from '@/types';
import { makeBotDecision, getBotActionDelay } from '@/bot-ai';
import { getActionDescription } from '@/utils/botActionService';

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

        // Send action to state machine
        send({ type: 'PLAYER_ACTION', action });

        // Clear message after 2 seconds
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
      timer = setTimeout(() => {
        send({ type: 'COMPLETE_HAND' });
      }, 3000);
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
  }, [state, isProcessingBotAction, send]);

  const currentPlayer = context.players[context.currentPlayerIndex];
  const isHumanTurn = currentPlayer?.type === 'human';
  const currentBet = Math.max(...context.players.map(p => p.currentBet));
  const callAmount = currentBet - (currentPlayer?.currentBet || 0);
  const canCheck = callAmount === 0;

  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        {/* Debug Info */}
        <div className="bg-black/50 backdrop-blur rounded-lg p-4 mb-4 text-sm font-mono">
          <div className="flex justify-between items-center">
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
              <span className="text-gray-400">Pot:</span>{' '}
              <span className="text-yellow-400">${context.pot.totalPot}</span>
            </div>
          </div>
        </div>

        {/* Bot Action Message */}
        {botActionMessage && (
          <div className="mb-4 text-center">
            <div className="bg-blue-600/90 backdrop-blur text-white py-3 px-6 rounded-lg inline-block animate-fade-in">
              {botActionMessage}
            </div>
          </div>
        )}

        {/* Poker Table */}
        <div className="bg-felt-600 rounded-[3rem] border-8 border-gray-800 shadow-2xl p-12 relative">
          {/* Community Cards */}
          <div className="flex justify-center gap-2 mb-8">
            {context.communityCards.length > 0 ? (
              context.communityCards.map((card, index) => (
                <div
                  key={index}
                  className="w-16 h-24 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-2xl font-bold animate-card-deal"
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
              <div className="text-white/50 text-center py-8">
                {state.matches({ inGame: 'postingBlinds' })
                  ? 'Posting blinds...'
                  : 'Waiting to deal...'}
              </div>
            )}
          </div>

          {/* Pot Display */}
          <div className="text-center mb-8">
            <div className="bg-black/30 backdrop-blur rounded-full px-6 py-2 inline-block">
              <span className="text-yellow-400 font-bold text-xl">
                Pot: ${context.pot.totalPot}
              </span>
            </div>
          </div>

          {/* Players */}
          <div className="grid grid-cols-3 gap-4">
            {context.players.map((player, index) => (
              <div
                key={player.id}
                className={`bg-gray-800/90 backdrop-blur rounded-xl p-4 transition-all ${
                  index === context.currentPlayerIndex ? 'ring-4 ring-yellow-400 scale-105' : ''
                } ${player.isFolded ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold">{player.name}</span>
                    {player.type === 'bot' && player.botDifficulty && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({player.botDifficulty})
                      </span>
                    )}
                  </div>
                  <span className="text-green-400 font-bold">${player.chips}</span>
                </div>

                {/* Hole Cards */}
                {player.holeCards.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {player.holeCards.map((card, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="w-12 h-16 rounded shadow-md flex items-center justify-center text-sm font-bold"
                      >
                        {player.type === 'human' ? (
                          <div className="w-full h-full bg-white rounded flex flex-col items-center justify-center">
                            <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                              {card.rank}
                            </span>
                            <span className={card.suit === '♥' || card.suit === '♦' ? 'text-card-red' : 'text-card-black'}>
                              {card.suit}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-blue-600 rounded flex items-center justify-center text-white">
                            ?
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Status */}
                <div className="space-y-1">
                  {player.isFolded && (
                    <div className="text-red-400 text-sm font-semibold">✗ Folded</div>
                  )}
                  {player.isAllIn && (
                    <div className="text-yellow-400 text-sm font-semibold">⬆ All-In!</div>
                  )}
                  {player.currentBet > 0 && !player.isFolded && (
                    <div className="text-blue-400 text-sm">Bet: ${player.currentBet}</div>
                  )}
                  {index === context.currentPlayerIndex && !player.isFolded && !player.isAllIn && (
                    <div className="text-yellow-400 text-sm font-semibold animate-pulse">
                      {player.type === 'human' ? '→ Your turn' : '→ Thinking...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons - Only show for human player's turn */}
          {state.matches('inGame') && isHumanTurn && currentPlayer && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Fold
              </button>

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
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Check
                </button>
              )}

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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Call ${Math.min(callAmount, currentPlayer.chips)}
                </button>
              )}

              <button
                onClick={() => {
                  const raiseAmount = Math.min(
                    callAmount + context.bigBlind,
                    currentPlayer.chips
                  );
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
                disabled={currentPlayer.chips <= callAmount}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Raise ${Math.min(callAmount + context.bigBlind, currentPlayer.chips)}
              </button>

              {currentPlayer.chips > callAmount && (
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
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  All-In ${currentPlayer.chips}
                </button>
              )}
            </div>
          )}

          {/* Game Over Screen */}
          {state.matches('gameOver') && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center rounded-[3rem]">
              <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center">
                <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                <p className="text-gray-400 mb-6">
                  {context.players[0]?.chips ?? 0 > 0
                    ? 'Congratulations! You won!'
                    : 'Better luck next time!'}
                </p>
                <div className="mb-4">
                  <div className="text-lg font-semibold mb-2">Final Standings:</div>
                  {[...context.players]
                    .sort((a, b) => b.chips - a.chips)
                    .map((player, index) => (
                      <div key={player.id} className="flex justify-between py-1">
                        <span>
                          {index + 1}. {player.name}
                        </span>
                        <span className="text-green-400">${player.chips}</span>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => send({ type: 'RESET_GAME' })}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                >
                  Return to Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Debug Actions */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => send({ type: 'ADVANCE_PHASE' })}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Advance Phase (Debug)
          </button>
          <button
            onClick={() => send({ type: 'END_GAME' })}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            End Game
          </button>
        </div>
      </div>
    </div>
  );
}
