import { useMemo } from 'react';
import { HandEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import { Card } from '@/game-logic/models/Card';
import { GamePhase } from '@/utils/constants';

interface HandStrengthProps {
  holeCards: Card[];
  communityCards: Card[];
  phase: GamePhase;
}

export default function HandStrength({ holeCards, communityCards, phase }: HandStrengthProps) {
  const handEvaluator = useMemo(() => new HandEvaluator(), []);

  // Only show after flop
  if (phase === 'preflop' || communityCards.length < 3 || holeCards.length !== 2) {
    return null;
  }

  const allCards = [...holeCards, ...communityCards];

  // Evaluate hand with error handling
  let handResult;
  try {
    handResult = handEvaluator.evaluateHand(allCards);
    // Validate handResult has required properties
    if (!handResult || typeof handResult.rank !== 'number' || !handResult.name || !handResult.description) {
      console.error('Invalid hand result from evaluator:', handResult);
      return null;
    }
  } catch (error) {
    console.error('Error evaluating hand:', error);
    return null;
  }

  // Get strength color based on hand rank
  const getStrengthColor = (rank: number): string => {
    if (rank >= 8) return 'text-purple-400'; // Straight flush or royal flush
    if (rank >= 7) return 'text-red-400'; // Four of a kind
    if (rank >= 6) return 'text-orange-400'; // Full house
    if (rank >= 5) return 'text-yellow-400'; // Flush
    if (rank >= 4) return 'text-green-400'; // Straight
    if (rank >= 3) return 'text-blue-400'; // Three of a kind
    if (rank >= 2) return 'text-cyan-400'; // Two pair
    if (rank >= 1) return 'text-gray-400'; // Pair
    return 'text-gray-500'; // High card
  };

  const getStrengthBars = (rank: number): number => {
    // Convert rank (0-9) to bars (1-5)
    if (rank >= 8) return 5; // Straight flush
    if (rank >= 6) return 4; // Four of a kind, Full house
    if (rank >= 4) return 3; // Flush, Straight
    if (rank >= 2) return 2; // Three of a kind, Two pair
    return 1; // Pair, High card
  };

  const strengthBars = getStrengthBars(handResult.rank);
  const strengthColor = getStrengthColor(handResult.rank);

  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg backdrop-blur-sm min-w-[200px]">
      <h3 className="text-white text-xs font-semibold mb-2 opacity-70">Your Hand</h3>

      {/* Hand Name */}
      <div className={`${strengthColor} font-bold text-lg mb-1`}>{handResult.name}</div>

      {/* Hand Description */}
      <div className="text-gray-300 text-xs mb-3">{handResult.description}</div>

      {/* Strength Bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`h-2 flex-1 rounded-full transition-all ${
              bar <= strengthBars ? strengthColor.replace('text-', 'bg-') : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="text-center text-xs text-gray-400 mt-2">
        {strengthBars === 5 && 'Monster!'}
        {strengthBars === 4 && 'Very Strong'}
        {strengthBars === 3 && 'Strong'}
        {strengthBars === 2 && 'Medium'}
        {strengthBars === 1 && 'Weak'}
      </div>
    </div>
  );
}
