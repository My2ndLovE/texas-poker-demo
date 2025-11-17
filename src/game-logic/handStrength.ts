/**
 * Hand Strength Evaluation
 * Calculates the strength of a poker hand (0.0 to 1.0)
 */

import Hand from 'pokersolver';
import { cardToPokersolverFormat } from '@/utils/deck';
import type { Card } from '@/types';

/**
 * Calculate hand strength as a value between 0 and 1
 * 0 = worst possible hand (high card, low cards)
 * 1 = best possible hand (royal flush)
 */
export function calculateHandStrength(
  holeCards: ReadonlyArray<Card>,
  communityCards: ReadonlyArray<Card>
): number {
  if (holeCards.length === 0) return 0;

  const allCards = [
    ...holeCards.map(cardToPokersolverFormat),
    ...communityCards.map(cardToPokersolverFormat),
  ];

  // Need at least 2 cards to evaluate
  if (allCards.length < 2) return 0;

  const hand = Hand.solve(allCards);

  // Hand rank mapping (0-9, where 9 is royal flush)
  // Convert to 0-1 scale with weighting
  const rankStrength = hand.rank / 9;

  return rankStrength;
}

/**
 * Calculate pre-flop hand strength based on hole cards only
 * Uses Chen formula approximation
 */
export function calculatePreflopStrength(holeCards: ReadonlyArray<Card>): number {
  if (holeCards.length !== 2) return 0;

  const card1 = holeCards[0]!;
  const card2 = holeCards[1]!;

  // Convert rank to numerical value (A=14, K=13, Q=12, J=11, T=10, 9-2)
  const rankToValue = (rank: string): number => {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    if (rank === 'T') return 10;
    return parseInt(rank);
  };

  const val1 = rankToValue(card1.rank);
  const val2 = rankToValue(card2.rank);
  const highCard = Math.max(val1, val2);
  const lowCard = Math.min(val1, val2);

  // Chen formula (simplified)
  let score = 0;

  // High card score
  if (highCard === 14) score += 10; // Ace
  else if (highCard === 13) score += 8; // King
  else if (highCard === 12) score += 7; // Queen
  else if (highCard === 11) score += 6; // Jack
  else score += highCard / 2;

  // Pair bonus
  if (val1 === val2) {
    score *= 2;
    if (score < 5) score = 5;
  }

  // Suited bonus
  if (card1.suit === card2.suit) {
    score += 2;
  }

  // Gap penalty (distance between cards)
  const gap = highCard - lowCard;
  if (gap === 1) {
    score += 1; // Connected (no gap)
  } else if (gap === 2) {
    score += 0; // 1 gap
  } else if (gap === 3) {
    score -= 1; // 2 gap
  } else if (gap === 4) {
    score -= 2; // 3 gap
  } else if (gap >= 5) {
    score -= 4; // 4+ gap
  }

  // Normalize to 0-1 scale (max Chen score is roughly 20)
  return Math.min(Math.max(score / 20, 0), 1);
}

/**
 * Estimate pot odds based on current pot and bet to call
 */
export function calculatePotOdds(potSize: number, betToCall: number): number {
  if (betToCall === 0) return 1; // No cost to call
  return potSize / (potSize + betToCall);
}

/**
 * Simple hand categorization
 */
export function categorizeHandRank(rank: number): 'premium' | 'strong' | 'medium' | 'weak' {
  if (rank >= 7) return 'premium'; // Four of a kind, Straight flush, Royal flush
  if (rank >= 5) return 'strong'; // Flush, Full house
  if (rank >= 3) return 'medium'; // Three of a kind, Straight
  return 'weak'; // High card, Pair, Two pair
}

/**
 * Calculate outs (cards that can improve the hand)
 * This is a simplified version
 */
export function estimateOuts(
  holeCards: ReadonlyArray<Card>,
  communityCards: ReadonlyArray<Card>
): number {
  // Simplified outs calculation
  // In a real implementation, this would analyze:
  // - Flush draws (9 outs)
  // - Straight draws (8 outs for open-ended, 4 for gutshot)
  // - Pair to trips (2 outs)
  // - Two pair to full house (4 outs)

  const allCards = [...holeCards, ...communityCards];

  // Count suits
  const suitCounts = new Map<string, number>();
  allCards.forEach((card) => {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
  });

  let outs = 0;

  // Flush draw (4 cards of same suit = 9 outs)
  for (const count of suitCounts.values()) {
    if (count === 4) outs += 9;
  }

  // This is a simplified estimation
  // Real implementation would need more sophisticated analysis
  return outs;
}
