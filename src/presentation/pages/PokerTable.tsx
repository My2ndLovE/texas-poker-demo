import React, { useEffect } from 'react';
import { useGameStore } from '@/state-management/gameStore';
import { PlayerSeat } from '../components/game/PlayerSeat';
import { ActionButtons } from '../components/game/ActionButtons';
import { PlayingCard } from '../components/cards/PlayingCard';
import { createAction } from '@/game-logic/models/Action';
import { ActionType, GamePhase, PlayerStatus } from '@/utils/constants';

export const PokerTable: React.FC = () => {
  const {
    gameState,
    startNewHand,
    processPlayerAction,
    isProcessing,
  } = useGameStore();

  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.WaitingToStart) {
      startNewHand();
    }
  }, [gameState, startNewHand]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  const humanPlayer = gameState.players.find((p) => !p.isBot);
  const botPlayers = gameState.players.filter((p) => p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isBot;

  const handleAction = (action: ActionType, amount: number) => {
    if (!humanPlayer || isProcessing) return;

    const playerAction = createAction(action, humanPlayer.id, amount);
    processPlayerAction(playerAction);
  };

  const handleNextHand = () => {
    if (gameState.phase === GamePhase.HandComplete) {
      startNewHand();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green-dark to-poker-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-lg mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Texas Hold'em Poker</h1>
            <div className="text-sm text-gray-400">
              Hand #{gameState.handNumber} | Phase: {gameState.phase}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">Pot: ${gameState.pot.totalPot}</div>
            <div className="text-sm">Current Bet: ${gameState.currentBet}</div>
          </div>
        </div>

        {/* Community Cards */}
        {gameState.communityCards.length > 0 && (
          <div className="bg-poker-felt p-6 rounded-lg mb-4 flex justify-center gap-2">
            <div className="text-white font-bold mr-4 self-center">Community Cards:</div>
            {gameState.communityCards.map((card, idx) => (
              <PlayingCard key={idx} card={card} />
            ))}
          </div>
        )}

        {/* Bot Players */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {botPlayers.map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              isCurrentPlayer={currentPlayer?.id === player.id}
              showCards={gameState.phase === GamePhase.Showdown}
            />
          ))}
        </div>

        {/* Human Player */}
        {humanPlayer && (
          <div className="mb-4">
            <PlayerSeat
              player={humanPlayer}
              isCurrentPlayer={currentPlayer?.id === humanPlayer.id}
              showCards={true}
            />
          </div>
        )}

        {/* Action Buttons */}
        {isHumanTurn &&
          humanPlayer &&
          humanPlayer.status !== PlayerStatus.Folded &&
          humanPlayer.status !== PlayerStatus.AllIn &&
          gameState.phase !== GamePhase.HandComplete &&
          gameState.phase !== GamePhase.Showdown && (
            <ActionButtons
              player={humanPlayer}
              currentBet={gameState.currentBet}
              minRaise={gameState.minRaise}
              onAction={handleAction}
            />
          )}

        {/* Waiting message */}
        {!isHumanTurn && isProcessing && (
          <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
            <div className="text-xl">Waiting for {currentPlayer?.name}...</div>
          </div>
        )}

        {/* Hand Complete */}
        {gameState.phase === GamePhase.HandComplete && (
          <div className="bg-green-800 text-white p-6 rounded-lg text-center">
            <div className="text-2xl font-bold mb-4">Hand Complete!</div>

            {/* Winner Information */}
            {gameState.handResult && (
              <div className="mb-6">
                {gameState.handResult.winners.map((winner, idx) => (
                  <div key={idx} className="text-xl mb-2">
                    <span className="font-bold text-yellow-300">{winner.playerName}</span>
                    {' wins '}
                    <span className="font-bold text-green-300">${winner.amount}</span>
                    {winner.handDescription && gameState.handResult?.showdown && (
                      <span className="text-gray-300">
                        {' with '}
                        {winner.handDescription}
                      </span>
                    )}
                    {gameState.handResult && !gameState.handResult.showdown && (
                      <span className="text-gray-300"> (everyone else folded)</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleNextHand}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-xl transition"
            >
              Next Hand
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
