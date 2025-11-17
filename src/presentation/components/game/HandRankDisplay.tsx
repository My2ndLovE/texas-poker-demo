import { handEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import type { Card } from '@/types';
import { useGameStore } from '@/state-management/gameStore';

export function HandRankDisplay() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) return null;

  const humanPlayer = gameState.players.find((p) => p.type === 'human');
  if (!humanPlayer || humanPlayer.holeCards.length === 0) return null;

  // Only show hand rank if there are community cards
  if (gameState.communityCards.length === 0) {
    return (
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-800/95 px-6 py-3 rounded-lg border-2 border-gray-700">
        <p className="text-gray-400 text-sm">
          Your Cards: {humanPlayer.holeCards.map((c) => c.rank + c.suit).join(' ')}
        </p>
      </div>
    );
  }

  try {
    const allCards: Card[] = [...humanPlayer.holeCards, ...gameState.communityCards];
    const handResult = handEvaluator.evaluateHand(allCards);

    return (
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-800/95 px-6 py-3 rounded-lg border-2 border-gray-700 shadow-lg">
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-lg">{handResult.description}</p>
          <p className="text-gray-400 text-xs mt-1">
            Your Cards: {humanPlayer.holeCards.map((c) => c.rank + c.suit).join(' ')}
          </p>
        </div>
      </div>
    );
  } catch (error) {
    // Not enough cards to evaluate yet
    return null;
  }
}
