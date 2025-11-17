import { Card } from './Card';
import type { Rank, Suit } from '@/types';

export class Deck {
  private cards: Card[];
  private dealtCards: Card[];
  private burnedCards: Card[];

  constructor() {
    this.cards = [];
    this.dealtCards = [];
    this.burnedCards = [];
    this.initialize();
  }

  /**
   * Initialize a standard 52-card deck
   */
  private initialize(): void {
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits: Suit[] = ['h', 'd', 'c', 's'];

    this.cards = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(rank, suit));
      }
    }
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle(): void {
    const array = this.cards;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Reset the deck to initial state and shuffle
   */
  reset(): void {
    this.initialize();
    this.shuffle();
    this.dealtCards = [];
    this.burnedCards = [];
  }

  /**
   * Deal a single card from the deck
   */
  dealOne(): Card {
    const card = this.cards.pop();
    if (!card) {
      throw new Error('No cards left in deck');
    }
    this.dealtCards.push(card);
    return card;
  }

  /**
   * Deal multiple cards
   */
  deal(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.dealOne());
    }
    return cards;
  }

  /**
   * Burn a card (discard it without using it)
   */
  burn(): void {
    const card = this.cards.pop();
    if (!card) {
      throw new Error('No cards left in deck to burn');
    }
    this.burnedCards.push(card);
  }

  /**
   * Get the number of cards remaining in the deck
   */
  getRemainingCount(): number {
    return this.cards.length;
  }

  /**
   * Get all dealt cards
   */
  getDealtCards(): Card[] {
    return [...this.dealtCards];
  }

  /**
   * Get all burned cards
   */
  getBurnedCards(): Card[] {
    return [...this.burnedCards];
  }

  /**
   * Check if deck is empty
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Create a new deck and shuffle it
   */
  static createAndShuffle(): Deck {
    const deck = new Deck();
    deck.shuffle();
    return deck;
  }

  /**
   * Get all cards in the deck (for testing)
   */
  getAllCards(): Card[] {
    return [...this.cards];
  }
}
