import { Hand } from 'pokersolver';
import type { Card, HandResult, HandRank } from '@/types';

/**
 * HandEvaluator wraps the pokersolver library to evaluate poker hands
 */
export class HandEvaluator {
  /**
   * Evaluate the best 5-card hand from the given cards
   * @param cards Array of 5-7 cards (2 hole cards + 5 community cards for Texas Hold'em)
   * @returns HandResult with rank, description, and value
   */
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5 || cards.length > 7) {
      throw new Error(`Invalid number of cards for evaluation: ${cards.length}. Expected 5-7.`);
    }

    // Convert Card[] to pokersolver format (e.g., "As", "Kh")
    const cardStrings = cards.map((c) => c.toString());

    // Solve best 5-card hand from the given cards
    const hand = Hand.solve(cardStrings);

    return {
      rank: this.mapHandTypeToRank(hand.name),
      description: hand.descr,
      cards: hand.cards.map((cardStr: string) => {
        const rank = cardStr[0] as Card['rank'];
        const suit = cardStr[1].toLowerCase() as Card['suit'];
        return {
          rank,
          suit,
          id: `${rank}${suit}`,
        };
      }),
      value: hand.rank,
    };
  }

  /**
   * Compare two hands and determine the winner
   * @returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie
   */
  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const h1Strings = hand1Cards.map((c) => c.toString());
    const h2Strings = hand2Cards.map((c) => c.toString());

    const hand1 = Hand.solve(h1Strings);
    const hand2 = Hand.solve(h2Strings);

    const winners = Hand.winners([hand1, hand2]);

    if (winners.length > 1) {
      return 0; // Tie
    }

    if (winners[0] === hand1) {
      return 1; // hand1 wins
    }

    return -1; // hand2 wins
  }

  /**
   * Determine the winner(s) from multiple hands
   * @param hands Array of [playerId, cards] tuples
   * @returns Array of winning player IDs (can have multiple winners in case of tie)
   */
  findWinners(hands: Array<{ playerId: string; cards: Card[] }>): string[] {
    if (hands.length === 0) {
      return [];
    }

    if (hands.length === 1) {
      return [hands[0].playerId];
    }

    // Convert all hands to pokersolver format
    const solvedHands = hands.map((h) => {
      const cardStrings = h.cards.map((c) => c.toString());
      return {
        playerId: h.playerId,
        hand: Hand.solve(cardStrings),
      };
    });

    // Get winner hands from pokersolver
    const pokersolverHands = solvedHands.map((sh) => sh.hand);
    const winningHands = Hand.winners(pokersolverHands);

    // Map back to player IDs
    const winnerIds = solvedHands
      .filter((sh) => winningHands.includes(sh.hand))
      .map((sh) => sh.playerId);

    return winnerIds;
  }

  /**
   * Map pokersolver hand name to our HandRank enum
   */
  private mapHandTypeToRank(handName: string): HandRank {
    const handRankMap: Record<string, HandRank> = {
      'High Card': 0,
      Pair: 1,
      'Two Pair': 2,
      'Three of a Kind': 3,
      Straight: 4,
      Flush: 5,
      'Full House': 6,
      'Four of a Kind': 7,
      'Straight Flush': 8,
      'Royal Flush': 9,
    };

    const rank = handRankMap[handName];
    if (rank === undefined) {
      throw new Error(`Unknown hand type: ${handName}`);
    }

    return rank as HandRank;
  }

  /**
   * Get a simplified hand strength score (0-1) for bot AI decision making
   * Higher is better
   */
  getHandStrength(cards: Card[]): number {
    if (cards.length < 2) {
      return 0;
    }

    // If we have 5+ cards, evaluate the full hand
    if (cards.length >= 5) {
      const result = this.evaluateHand(cards);
      // Map rank (0-9) to 0-1 scale
      return (result.rank + 1) / 10;
    }

    // For preflop (2 cards), use simple heuristic
    if (cards.length === 2) {
      return this.getPreflopStrength(cards);
    }

    // For 3-4 cards, we can't fully evaluate yet
    return 0.3; // Neutral strength
  }

  /**
   * Calculate preflop hand strength (0-1)
   */
  private getPreflopStrength(holeCards: Card[]): number {
    if (holeCards.length !== 2) {
      return 0;
    }

    const [card1, card2] = holeCards;
    const ranks = [card1.rank, card2.rank];
    const suited = card1.suit === card2.suit;

    // Premium pairs
    if (ranks[0] === ranks[1]) {
      const pairValue: Record<string, number> = {
        A: 1.0,
        K: 0.95,
        Q: 0.9,
        J: 0.85,
        T: 0.8,
        '9': 0.75,
        '8': 0.7,
        '7': 0.65,
        '6': 0.6,
        '5': 0.55,
        '4': 0.5,
        '3': 0.45,
        '2': 0.4,
      };
      return pairValue[ranks[0]] || 0.4;
    }

    // High cards
    const rankValues: Record<string, number> = {
      A: 14,
      K: 13,
      Q: 12,
      J: 11,
      T: 10,
      '9': 9,
      '8': 8,
      '7': 7,
      '6': 6,
      '5': 5,
      '4': 4,
      '3': 3,
      '2': 2,
    };

    const highCard = Math.max(rankValues[ranks[0]], rankValues[ranks[1]]);
    const lowCard = Math.min(rankValues[ranks[0]], rankValues[ranks[1]]);

    // Base strength on high card (0.3-0.7)
    let strength = 0.3 + (highCard / 14) * 0.4;

    // Bonus for suited (+0.05)
    if (suited) {
      strength += 0.05;
    }

    // Bonus for connected cards (+0.05)
    if (Math.abs(highCard - lowCard) === 1) {
      strength += 0.05;
    }

    // Bonus for both cards being high (A-K, A-Q, K-Q, etc.)
    if (highCard >= 12 && lowCard >= 11) {
      strength += 0.1;
    }

    return Math.min(strength, 0.95); // Cap below pocket aces
  }
}

// Singleton instance
export const handEvaluator = new HandEvaluator();
