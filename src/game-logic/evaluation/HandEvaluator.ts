import { evalHand, winners } from 'poker-evaluator';
import { Card, cardToString } from '../models/Card';
import { HandResult } from '../models/Hand';
import { HandRank } from '@/utils/constants';

export class HandEvaluator {
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5 || cards.length > 7) {
      throw new Error('Can only evaluate 5-7 cards');
    }

    // Convert cards to poker-evaluator format (e.g., "Ah", "Kd")
    const cardStrings = cards.map(cardToString);

    // Evaluate with poker-evaluator
    const result = evalHand(cardStrings);

    const rank = this.mapHandTypeToRank(result.handType, cardStrings);

    return {
      rank,
      description: result.handName,
      cards: cards,
      value: result.value,
    };
  }

  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const result1 = this.evaluateHand(hand1Cards);
    const result2 = this.evaluateHand(hand2Cards);

    // Higher value wins
    if (result1.value > result2.value) return 1;
    if (result1.value < result2.value) return -1;
    return 0;
  }

  findWinners(hands: { playerId: string; cards: Card[] }[]): string[] {
    if (hands.length === 0) return [];
    if (hands.length === 1) return [hands[0].playerId];

    const evaluated = hands.map((h) => ({
      playerId: h.playerId,
      result: this.evaluateHand(h.cards),
    }));

    // Find max value
    const maxValue = Math.max(...evaluated.map((e) => e.result.value));

    // Return all players with max value
    return evaluated.filter((e) => e.result.value === maxValue).map((e) => e.playerId);
  }

  private mapHandTypeToRank(handType: number, cardStrings: string[]): HandRank {
    // poker-evaluator uses different numbering
    // 0 = invalid, 1 = high card, 2 = pair, ..., 9 = straight flush
    switch (handType) {
      case 1:
        return HandRank.HighCard;
      case 2:
        return HandRank.OnePair;
      case 3:
        return HandRank.TwoPair;
      case 4:
        return HandRank.ThreeOfAKind;
      case 5:
        return HandRank.Straight;
      case 6:
        return HandRank.Flush;
      case 7:
        return HandRank.FullHouse;
      case 8:
        return HandRank.FourOfAKind;
      case 9:
        // Check if it's royal flush (T, J, Q, K, A all same suit)
        if (this.isRoyalFlush(cardStrings)) {
          return HandRank.RoyalFlush;
        }
        return HandRank.StraightFlush;
      default:
        return HandRank.HighCard;
    }
  }

  private isRoyalFlush(cardStrings: string[]): boolean {
    // Royal flush is T, J, Q, K, A all same suit
    const royalRanks = new Set(['T', 'J', 'Q', 'K', 'A']);
    const ranks = cardStrings.map((c) => c[0]);
    const rankSet = new Set(ranks);

    // Check if we have all 5 royal ranks
    const hasAllRoyalRanks = Array.from(royalRanks).every((rank) => rankSet.has(rank));

    if (!hasAllRoyalRanks) return false;

    // Check that all cards are same suit
    const suits = cardStrings.map((c) => c[1]);
    const firstSuit = suits[0];
    return suits.every((s) => s === firstSuit);
  }
}
