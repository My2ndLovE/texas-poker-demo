import { Hand } from 'pokersolver';
import { Card } from '../models/Card';
import { cardToString } from '../models/Card';
import { HandResult } from '../models/Hand';

export class HandEvaluator {
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    const cardStrings = cards.map(cardToString);
    const hand = Hand.solve(cardStrings);
    const bestCards = hand.cardPool || hand.cards;

    return {
      rank: this.mapHandTypeToRank(hand.rank),
      name: hand.name,
      description: hand.descr,
      cards: bestCards.slice(0, 5).map((c: any) => ({
        rank: c.value === '10' ? 'T' : c.value.toUpperCase(),
        suit: c.suit.charAt(0).toLowerCase(),
      })),
      value: hand.rank,
    };
  }

  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const h1Strings = hand1Cards.map(cardToString);
    const h2Strings = hand2Cards.map(cardToString);

    const hand1 = Hand.solve(h1Strings);
    const hand2 = Hand.solve(h2Strings);

    const winners = Hand.winners([hand1, hand2]);

    if (winners.length === 2) {
      return 0;
    }

    return winners[0] === hand1 ? 1 : -1;
  }

  determineWinners(handsWithPlayers: Array<{ playerId: string; cards: Card[] }>): string[] {
    if (handsWithPlayers.length === 0) return [];
    if (handsWithPlayers.length === 1) return [handsWithPlayers[0].playerId];

    const hands = handsWithPlayers.map((h) => ({
      hand: Hand.solve(h.cards.map(cardToString)),
      playerId: h.playerId,
    }));

    const pokersolverHands = hands.map((h) => h.hand);
    const winners = Hand.winners(pokersolverHands);

    const winnerPlayerIds = hands
      .filter((h) => winners.includes(h.hand))
      .map((h) => h.playerId);

    return winnerPlayerIds;
  }

  private mapHandTypeToRank(handRank: number): number {
    return handRank - 1;
  }
}
