import { useEffect } from 'react';
import { useGameStore } from '@/state-management/gameStore';
import PokerTable from '../components/game/PokerTable';
import ActionButtons from '../components/game/ActionButtons';
import ActionHistory from '../components/game/ActionHistory';
import ShowdownResult from '../components/game/ShowdownResult';
import GameOverModal from '../components/game/GameOverModal';
import HandStrength from '../components/game/HandStrength';

export default function GamePage() {
  const { gameState, initializeGame, resetGame } = useGameStore();

  useEffect(() => {
    if (!gameState) {
      // Initialize game with 5 bots, 1000 chips, 10/20 blinds, medium difficulty
      initializeGame(5, 1000, 10, 20, 'medium');
    }
  }, [gameState, initializeGame]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-poker-green-dark">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-green-dark flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 shadow-lg border-b-2 border-yellow-600">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Texas Hold'em Poker
          </h1>

          <div className="flex gap-4 items-center">
            {/* Hand Number */}
            <div className="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
              Hand #{gameState.handNumber}
            </div>

            {/* Pot */}
            <div className="bg-green-700 px-4 py-1 rounded-full font-bold flex items-center gap-1">
              <span className="text-yellow-400">$</span>
              <span>{gameState.pot}</span>
            </div>

            {/* Phase Indicator */}
            <div
              className={`px-4 py-1 rounded-full font-semibold text-xs uppercase tracking-wider ${
                gameState.phase === 'preflop'
                  ? 'bg-blue-600'
                  : gameState.phase === 'flop'
                  ? 'bg-purple-600'
                  : gameState.phase === 'turn'
                  ? 'bg-orange-600'
                  : gameState.phase === 'river'
                  ? 'bg-red-600'
                  : 'bg-yellow-600 animate-pulse'
              }`}
            >
              {gameState.phase === 'showdown' ? '🏆 Showdown' : gameState.phase}
            </div>

            {/* Blinds Info */}
            <div className="hidden lg:flex gap-2 text-xs text-gray-400">
              <span>SB: ${gameState.smallBlind}</span>
              <span>/</span>
              <span>BB: ${gameState.bigBlind}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Poker Table */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Action History - positioned on the left side */}
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <ActionHistory actions={gameState.actionHistory} players={gameState.players} />
        </div>

        {/* Hand Strength - positioned on the right side */}
        <div className="absolute top-4 right-4 z-10 hidden md:block">
          <HandStrength
            holeCards={gameState.players.find((p) => !p.isBot)?.holeCards || []}
            communityCards={gameState.communityCards}
            phase={gameState.phase}
          />
        </div>

        <PokerTable gameState={gameState} />
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-900 p-4">
        <ActionButtons />
      </div>

      {/* Showdown Result Modal */}
      {gameState.showdownResult && (
        <ShowdownResult result={gameState.showdownResult} players={gameState.players} />
      )}

      {/* Game Over Modal */}
      <GameOverModal
        humanPlayer={gameState.players.find((p) => !p.isBot)}
        allPlayers={gameState.players}
        onRestart={() => {
          resetGame();
          // Re-initialize with same settings
          initializeGame(5, 1000, 10, 20, 'medium');
        }}
      />
    </div>
  );
}
