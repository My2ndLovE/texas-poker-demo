import { Card, createCard } from '../models/Card';
import { SUITS, RANKS, Suit, Rank } from '@/utils/constants';

export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.createFullDeck();
  }

  private createFullDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(createCard(rank as Rank, suit as Suit));
      }
    }
    return deck;
  }

  // Fisher-Yates shuffle algorithm
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error(`Cannot deal ${count} cards, only ${this.cards.length} remaining`);
    }

    const dealt: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.cards.pop();
      if (card) {
        dealt.push(card);
      }
    }
    return dealt;
  }

  burn(): void {
    if (this.cards.length === 0) {
      throw new Error('Cannot burn card from empty deck');
    }
    this.cards.pop();
  }

  reset(): void {
    this.cards = this.createFullDeck();
    this.shuffle();
  }

  remainingCards(): number {
    return this.cards.length;
  }

  getAllCards(): Card[] {
    return [...this.cards];
  }
}
