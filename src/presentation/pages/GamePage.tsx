import { useEffect } from 'react';
import { useGameStore } from '@/state-management/gameStore';
import PokerTable from '../components/game/PokerTable';
import ActionButtons from '../components/game/ActionButtons';

export default function GamePage() {
  const { gameState, initializeGame } = useGameStore();

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
      <div className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Texas Hold'em Poker</h1>
          <div className="flex gap-4 text-sm">
            <div>Hand #{gameState.handNumber}</div>
            <div>Pot: ${gameState.pot}</div>
            <div className="capitalize">{gameState.phase}</div>
          </div>
        </div>
      </div>

      {/* Poker Table */}
      <div className="flex-1 flex items-center justify-center p-4">
        <PokerTable gameState={gameState} />
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-900 p-4">
        <ActionButtons />
      </div>
    </div>
  );
}
