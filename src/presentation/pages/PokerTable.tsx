import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/state-management/gameStore';
import { PlayerSeat } from '../components/game/PlayerSeat';
import { ActionButtons } from '../components/game/ActionButtons';
import { PlayingCard } from '../components/cards/PlayingCard';
import { HelpModal } from '../components/game/HelpModal';
import { createAction } from '@/game-logic/models/Action';
import { ActionType, GamePhase, PlayerStatus } from '@/utils/constants';

export const PokerTable: React.FC = () => {
  const navigate = useNavigate();
  const {
    gameState,
    startNewHand,
    processPlayerAction,
    isProcessing,
    sessionStats,
    updateStats,
  } = useGameStore();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.WaitingToStart) {
      startNewHand();
    }
  }, [gameState, startNewHand]);

  // Update stats when hand completes
  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.HandComplete && gameState.handResult) {
      const humanPlayer = gameState.players.find((p) => !p.isBot);
      if (humanPlayer && gameState.handResult) {
        const winner = gameState.handResult.winners.find((w) => w.playerId === humanPlayer.id);
        const isWinner = !!winner;
        const wonAmount = winner ? winner.amount : 0;
        updateStats(wonAmount, gameState.pot.totalPot, isWinner);
      }
    }
  }, [gameState?.phase, gameState?.handResult, gameState?.players, gameState?.pot.totalPot, updateStats]);

  // Extract last action for each player from action history
  const playerLastActions = useMemo(() => {
    if (!gameState) return {};

    const lastActions: Record<string, { type: string; amount?: number }> = {};

    // Get actions from most recent betting round (after last phase change)
    const reversedActions = [...gameState.actionHistory].reverse();
    const seenPlayers = new Set<string>();

    for (const action of reversedActions) {
      if (!seenPlayers.has(action.playerId)) {
        lastActions[action.playerId] = {
          type: action.type,
          amount: action.amount,
        };
        seenPlayers.add(action.playerId);
      }
    }

    return lastActions;
  }, [gameState?.actionHistory]);

  // Get recent action log (last 8 actions)
  const recentActions = useMemo(() => {
    if (!gameState) return [];

    return gameState.actionHistory.slice(-8).reverse().map((action) => {
      const player = gameState.players.find(p => p.id === action.playerId);
      const playerName = player?.name || 'Unknown';

      let actionText = '';
      switch (action.type) {
        case ActionType.Fold:
          actionText = 'folded';
          break;
        case ActionType.Check:
          actionText = 'checked';
          break;
        case ActionType.Call:
          actionText = `called $${action.amount}`;
          break;
        case ActionType.Bet:
          actionText = `bet $${action.amount}`;
          break;
        case ActionType.Raise:
          actionText = `raised to $${player?.currentBet || action.amount}`;
          break;
        case ActionType.AllIn:
          actionText = `went all-in for $${action.amount}`;
          break;
        default:
          actionText = action.type;
      }

      return {
        playerName,
        text: actionText,
        type: action.type,
      };
    });
  }, [gameState?.actionHistory, gameState?.players]);

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

  // Check if player has busted out
  const playerBusted = humanPlayer && humanPlayer.chips === 0;

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

  // Game Over Screen
  if (playerBusted && gameState.phase === GamePhase.HandComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
        <div className="bg-gray-800 text-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center border-4 border-red-500">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-4xl font-bold mb-4">Game Over</h1>
          <p className="text-xl text-gray-300 mb-2">You've run out of chips!</p>
          <p className="text-gray-400 mb-8">Hands played: {gameState.handNumber}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg font-bold text-xl transition transform hover:scale-105"
            >
              🎮 Play Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green-dark to-poker-green p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-lg mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                  navigate('/');
                }
              }}
              className="px-3 py-2 md:px-4 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-xs md:text-sm transition"
            >
              ← Quit
            </button>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-xs md:text-sm transition flex items-center gap-1"
            >
              <span>❓</span>
              <span>Help</span>
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                <span>♠️♥️</span>
                <span className="hidden sm:inline">Texas Hold'em Poker</span>
                <span className="sm:hidden">Texas Hold'em</span>
                <span>♦️♣️</span>
              </h1>
              <div className="text-xs md:text-sm text-gray-400">
                Hand #{gameState.handNumber} | {gameState.phase}
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
              <span>🏆</span>
              <span>${gameState.pot.totalPot}</span>
            </div>
            <div className="text-xs md:text-sm text-gray-300">Current Bet: ${gameState.currentBet}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-9">
            {/* Community Cards */}
            <div className="bg-poker-felt p-6 rounded-lg mb-4 min-h-[140px] flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-600">
              {gameState.communityCards.length > 0 ? (
                <>
                  <div className="text-white font-bold mb-3 text-lg">Community Cards</div>
                  <div className="flex gap-3">
                    {gameState.communityCards.map((card, idx) => (
                      <div key={idx} className="transform hover:scale-110 transition-transform">
                        <PlayingCard card={card} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-4xl mb-2">🃏</div>
                  <div>Waiting for flop...</div>
                </div>
              )}
            </div>

            {/* Bot Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {botPlayers.map((player) => (
                <PlayerSeat
                  key={player.id}
                  player={player}
                  isCurrentPlayer={currentPlayer?.id === player.id}
                  showCards={false}
                  gamePhase={gameState.phase}
                  lastAction={playerLastActions[player.id]}
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
                  gamePhase={gameState.phase}
                  lastAction={playerLastActions[humanPlayer.id]}
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
                  potSize={gameState.pot.totalPot}
                  onAction={handleAction}
                />
              )}

            {/* Waiting message */}
            {!isHumanTurn && isProcessing && (
              <div className="bg-gray-800 text-white p-4 rounded-lg text-center shadow-lg">
                <div className="text-xl flex items-center justify-center gap-2">
                  <span className="animate-pulse">⏳</span>
                  <span>Waiting for {currentPlayer?.name}...</span>
                  <span className="animate-pulse">⏳</span>
                </div>
              </div>
            )}

            {/* Hand Complete */}
            {gameState.phase === GamePhase.HandComplete && (
              <div className="bg-gradient-to-br from-green-800 to-green-900 text-white p-6 rounded-lg text-center shadow-2xl border-4 border-yellow-400">
                <div className="text-3xl font-bold mb-4">🎉 Hand Complete! 🎉</div>

                {/* Winner Information */}
                {gameState.handResult && (
                  <div className="mb-6">
                    {gameState.handResult.winners.map((winner, idx) => (
                      <div key={idx} className="text-xl mb-2 p-3 bg-green-700 rounded-lg">
                        <span className="font-bold text-yellow-300 text-2xl">{winner.playerName}</span>
                        {' wins '}
                        <span className="font-bold text-green-300 text-2xl">${winner.amount}</span>
                        {winner.handDescription && gameState.handResult?.showdown && (
                          <span className="text-gray-200">
                            {' with '}
                            <span className="font-bold text-yellow-200">{winner.handDescription}</span>
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
                  className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-lg font-bold text-xl transition transform hover:scale-105 shadow-xl"
                >
                  ▶️ Next Hand
                </button>
              </div>
            )}
          </div>

          {/* Action Log Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 text-white rounded-lg p-4 shadow-xl lg:sticky lg:top-4 space-y-4">
              {/* Session Statistics */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>📊</span>
                  <span>Session Stats</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Hands Played:</span>
                    <span className="font-bold text-white">{sessionStats.handsPlayed}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Hands Won:</span>
                    <span className="font-bold text-green-400">{sessionStats.handsWon}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="font-bold text-blue-400">
                      {sessionStats.handsPlayed > 0
                        ? ((sessionStats.handsWon / sessionStats.handsPlayed) * 100).toFixed(1)
                        : '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Biggest Pot:</span>
                    <span className="font-bold text-yellow-400">${sessionStats.biggestPot}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Profit/Loss:</span>
                    <span className={`font-bold ${sessionStats.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sessionStats.totalWinnings >= 0 ? '+' : ''}${sessionStats.totalWinnings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-gray-400">Current Streak:</span>
                    <span className="font-bold text-purple-400">
                      {sessionStats.currentStreak > 0 ? `🔥 ${sessionStats.currentStreak}` : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Log */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>📋</span>
                  <span>Action Log</span>
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {recentActions.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                      No actions yet...
                    </div>
                  ) : (
                    recentActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="text-sm p-2 bg-gray-800 rounded border-l-4"
                        style={{
                          borderLeftColor:
                            action.type === ActionType.Fold ? '#dc2626' :
                            action.type === ActionType.Call ? '#3b82f6' :
                            action.type === ActionType.Check ? '#10b981' :
                            action.type === ActionType.Bet || action.type === ActionType.Raise ? '#eab308' :
                            action.type === ActionType.AllIn ? '#ef4444' :
                            '#6b7280'
                        }}
                      >
                        <span className="font-semibold text-yellow-300">{action.playerName}</span>
                        {' '}
                        <span className="text-gray-300">{action.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};
