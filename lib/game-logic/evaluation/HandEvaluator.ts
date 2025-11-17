import { Hand as PokerHand } from 'pokersolver';
import { Card, cardToString } from '../models/Card';
import { HandResult, HandRank, createHandResult, HAND_RANK_NAMES } from '../models/Hand';

// Map pokersolver rank to our HandRank enum
function mapPokerSolverRankToHandRank(pokerHandName: string): HandRank {
  const lowerName = pokerHandName.toLowerCase();
  if (lowerName.includes('royal flush')) return HandRank.RoyalFlush;
  if (lowerName.includes('straight flush')) return HandRank.StraightFlush;
  if (lowerName.includes('four of a kind')) return HandRank.FourOfAKind;
  if (lowerName.includes('full house')) return HandRank.FullHouse;
  if (lowerName.includes('flush')) return HandRank.Flush;
  if (lowerName.includes('straight')) return HandRank.Straight;
  if (lowerName.includes('three of a kind')) return HandRank.ThreeOfAKind;
  if (lowerName.includes('two pair')) return HandRank.TwoPair;
  if (lowerName.includes('pair')) return HandRank.Pair;
  return HandRank.HighCard;
}

export class HandEvaluator {
  // Evaluate the best 5-card hand from 7 cards (2 hole + 5 community)
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Convert Card[] to pokersolver format (e.g., "As", "Kh")
    const cardStrings = cards.map((c) => cardToString(c));

    // Use pokersolver to evaluate
    const hand = PokerHand.solve(cardStrings);

    const rank = mapPokerSolverRankToHandRank(hand.name);

    return createHandResult(rank, cards, hand.descr, hand.rank);
  }

  // Compare two hands, return 1 if hand1 wins, -1 if hand2 wins, 0 if tie
  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const cardStrings1 = hand1Cards.map((c) => cardToString(c));
    const cardStrings2 = hand2Cards.map((c) => cardToString(c));

    const h1 = PokerHand.solve(cardStrings1);
    const h2 = PokerHand.solve(cardStrings2);

    const winners = PokerHand.winners([h1, h2]);

    if (winners.length === 2) return 0; // Tie
    return winners[0] === h1 ? 1 : -1;
  }

  // Find winners from multiple players
  findWinners(playerHands: { playerId: string; cards: Card[] }[]): string[] {
    if (playerHands.length === 0) return [];
    if (playerHands.length === 1) return [playerHands[0].playerId];

    const hands = playerHands.map((ph) => {
      const cardStrings = ph.cards.map((c) => cardToString(c));
      return { playerId: ph.playerId, hand: PokerHand.solve(cardStrings) };
    });

    const pokerHands = hands.map((h) => h.hand);
    const winners = PokerHand.winners(pokerHands);

    // Find which player IDs correspond to winning hands
    const winnerIds = hands
      .filter((h) => winners.includes(h.hand))
      .map((h) => h.playerId);

    return winnerIds;
  }
}

// Singleton instance
export const handEvaluator = new HandEvaluator();
