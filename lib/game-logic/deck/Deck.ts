import { Card, SUITS, RANKS, Suit, Rank, createCard } from '../models/Card';

export class Deck {
  private cards: Card[];
  private dealtCards: Card[];
  private burnedCards: Card[];

  constructor() {
    this.cards = [];
    this.dealtCards = [];
    this.burnedCards = [];
    this.reset();
  }

  // Create a fresh 52-card deck
  reset(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(createCard(rank, suit));
      }
    }
    this.dealtCards = [];
    this.burnedCards = [];
  }

  // Fisher-Yates shuffle algorithm
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  // Deal a single card
  deal(): Card | null {
    if (this.cards.length === 0) {
      return null;
    }
    const card = this.cards.pop()!;
    this.dealtCards.push(card);
    return card;
  }

  // Deal multiple cards
  dealMultiple(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.deal();
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }

  // Burn a card (discard without showing)
  burn(): Card | null {
    if (this.cards.length === 0) {
      return null;
    }
    const card = this.cards.pop()!;
    this.burnedCards.push(card);
    return card;
  }

  // Get remaining cards count
  remainingCards(): number {
    return this.cards.length;
  }

  // Get dealt cards (for debugging/testing)
  getDealtCards(): Card[] {
    return [...this.dealtCards];
  }

  // Get burned cards (for debugging/testing)
  getBurnedCards(): Card[] {
    return [...this.burnedCards];
  }
}
