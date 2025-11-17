import type { pokerMachine } from '@/state-management/pokerMachine';
import type { GameSettings } from '@/types';

interface GamePageProps {
  state: ReturnType<typeof useMachine<typeof pokerMachine>>[0];
  send: ReturnType<typeof useMachine<typeof pokerMachine>>[1];
  settings: GameSettings;
}

import { useMachine } from '@xstate/react';

export default function GamePage({ state, send, settings: _settings }: GamePageProps) {
  const context = state.context;
  const currentState = state.value;

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
              <span className="text-gray-400">Players:</span>{' '}
              <span className="text-blue-400">{context.players.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Pot:</span>{' '}
              <span className="text-yellow-400">${context.pot.totalPot}</span>
            </div>
          </div>
        </div>

        {/* Poker Table */}
        <div className="bg-felt-600 rounded-[3rem] border-8 border-gray-800 shadow-2xl p-12 relative">
          {/* Community Cards */}
          <div className="flex justify-center gap-2 mb-8">
            {context.communityCards.length > 0 ? (
              context.communityCards.map((card, index) => (
                <div
                  key={index}
                  className="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold"
                >
                  {card.rank}
                  {card.suit}
                </div>
              ))
            ) : (
              <div className="text-white/50 text-center py-8">Waiting to deal...</div>
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
                className={`bg-gray-800/90 backdrop-blur rounded-xl p-4 ${
                  index === context.currentPlayerIndex ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{player.name}</span>
                  <span className="text-green-400">${player.chips}</span>
                </div>

                {/* Hole Cards */}
                <div className="flex gap-1">
                  {player.holeCards.map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="w-12 h-16 bg-white rounded shadow-md flex items-center justify-center text-sm font-bold"
                    >
                      {player.type === 'human' ? (
                        <>
                          {card.rank}
                          {card.suit}
                        </>
                      ) : (
                        <div className="w-full h-full bg-blue-600 rounded flex items-center justify-center text-white">
                          ?
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Status */}
                {player.isFolded && (
                  <div className="mt-2 text-red-400 text-sm">Folded</div>
                )}
                {player.isAllIn && (
                  <div className="mt-2 text-yellow-400 text-sm">All-In</div>
                )}
                {player.currentBet > 0 && (
                  <div className="mt-2 text-blue-400 text-sm">Bet: ${player.currentBet}</div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons - Only show for human player's turn */}
          {state.matches('inGame') && context.currentPlayerIndex === 0 && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() =>
                  send({
                    type: 'PLAYER_ACTION',
                    action: {
                      playerId: 'human-1',
                      type: 'fold',
                      amount: 0,
                      timestamp: Date.now(),
                    },
                  })
                }
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Fold
              </button>
              <button
                onClick={() =>
                  send({
                    type: 'PLAYER_ACTION',
                    action: {
                      playerId: 'human-1',
                      type: 'check',
                      amount: 0,
                      timestamp: Date.now(),
                    },
                  })
                }
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Check
              </button>
              <button
                onClick={() =>
                  send({
                    type: 'PLAYER_ACTION',
                    action: {
                      playerId: 'human-1',
                      type: 'call',
                      amount: context.bigBlind,
                      timestamp: Date.now(),
                    },
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Call ${context.bigBlind}
              </button>
              <button
                onClick={() =>
                  send({
                    type: 'PLAYER_ACTION',
                    action: {
                      playerId: 'human-1',
                      type: 'raise',
                      amount: context.bigBlind * 2,
                      timestamp: Date.now(),
                    },
                  })
                }
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Raise ${context.bigBlind * 2}
              </button>
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
