import { Hand } from 'pokersolver';
import { Card, cardToString } from '../models/Card';
import { HandResult } from '../models/Hand';

export class HandEvaluator {
  /**
   * Evaluates the best 5-card poker hand from up to 7 cards
   */
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Convert Card[] to pokersolver format (e.g., "Ah", "Kd")
    const cardStrings = cards.map(cardToString);

    // Solve for best hand
    const hand = Hand.solve(cardStrings);

    // hand.cardPool contains only the 5 cards used in the best hand
    const bestCards = hand.cardPool || hand.cards;

    return {
      rank: this.mapHandTypeToRank(hand.rank),
      name: hand.name,
      description: hand.descr,
      cards: bestCards.slice(0, 5).map((c: any) => ({
        rank: c.value === '10' ? 'T' : c.value.toUpperCase(),
        suit: c.suit.charAt(0).toLowerCase(),
      })),
      value: hand.rank, // Lower is better in pokersolver
    };
  }

  /**
   * Compares two hands and returns:
   * 1 if hand1 wins
   * -1 if hand2 wins
   * 0 if tie
   */
  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const h1Strings = hand1Cards.map(cardToString);
    const h2Strings = hand2Cards.map(cardToString);

    const hand1 = Hand.solve(h1Strings);
    const hand2 = Hand.solve(h2Strings);

    const winners = Hand.winners([hand1, hand2]);

    if (winners.length === 2) {
      return 0; // Tie
    }

    return winners[0] === hand1 ? 1 : -1;
  }

  /**
   * Determines winners from multiple hands
   */
  determineWinners(handsWithPlayers: Array<{ playerId: string; cards: Card[] }>): string[] {
    if (handsWithPlayers.length === 0) return [];
    if (handsWithPlayers.length === 1) return [handsWithPlayers[0].playerId];

    const hands = handsWithPlayers.map((h) => ({
      hand: Hand.solve(h.cards.map(cardToString)),
      playerId: h.playerId,
    }));

    const pokersolverHands = hands.map((h) => h.hand);
    const winners = Hand.winners(pokersolverHands);

    // Map winning hands back to player IDs
    const winnerPlayerIds = hands
      .filter((h) => winners.includes(h.hand))
      .map((h) => h.playerId);

    return winnerPlayerIds;
  }

  private mapHandTypeToRank(handRank: number): number {
    // pokersolver rank: 1 = high card, 2 = pair, ..., 9 = straight flush/royal flush
    // Our HandRank: 0 = high card, 1 = pair, ..., 9 = royal flush
    // Note: pokersolver doesn't distinguish royal flush from straight flush
    // Both are rank 9 (straight flush)
    return handRank - 1;
  }
}
