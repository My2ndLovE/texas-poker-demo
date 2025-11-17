import { Hand } from 'pokersolver';
import { Card } from '../models/Card';
import { cardToString } from '../models/Card';
import { HandResult } from '../models/Hand';

export class HandEvaluator {
  evaluateHand(cards: Card[]): HandResult {
    // Validate input
    if (!cards || !Array.isArray(cards)) {
      throw new Error('Cards must be a valid array');
    }

    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Validate each card has required properties
    for (const card of cards) {
      if (!card || !card.rank || !card.suit) {
        throw new Error(`Invalid card in hand: ${JSON.stringify(card)}`);
      }
    }

    try {
      const cardStrings = cards.map(cardToString);
      const hand = Hand.solve(cardStrings);

      if (!hand || !hand.name || !hand.descr) {
        throw new Error('Pokersolver returned invalid hand result');
      }

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
    } catch (error) {
      console.error('Error evaluating hand:', error);
      throw new Error(`Failed to evaluate hand: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    // Validate input
    if (!handsWithPlayers || !Array.isArray(handsWithPlayers)) {
      console.error('Invalid handsWithPlayers input');
      return [];
    }

    if (handsWithPlayers.length === 0) return [];
    if (handsWithPlayers.length === 1) return [handsWithPlayers[0].playerId];

    try {
      const hands = handsWithPlayers.map((h) => {
        if (!h || !h.playerId || !h.cards || !Array.isArray(h.cards)) {
          throw new Error(`Invalid hand data for player: ${h?.playerId || 'unknown'}`);
        }
        return {
          hand: Hand.solve(h.cards.map(cardToString)),
          playerId: h.playerId,
        };
      });

      const pokersolverHands = hands.map((h) => h.hand);
      const winners = Hand.winners(pokersolverHands);

      if (!winners || !Array.isArray(winners)) {
        console.error('Pokersolver winners() returned invalid result');
        return [handsWithPlayers[0].playerId]; // Fallback to first player
      }

      const winnerPlayerIds = hands
        .filter((h) => winners.includes(h.hand))
        .map((h) => h.playerId);

      return winnerPlayerIds.length > 0 ? winnerPlayerIds : [handsWithPlayers[0].playerId];
    } catch (error) {
      console.error('Error determining winners:', error);
      // Fallback: return first player as winner
      return [handsWithPlayers[0].playerId];
    }
  }

  private mapHandTypeToRank(handRank: number): number {
    return handRank - 1;
  }
}
