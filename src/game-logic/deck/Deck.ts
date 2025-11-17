import { Card, Rank, Suit } from '../models/Card';

export class Deck {
  private cards: Card[];
  private burnedCards: Card[];

  constructor() {
    this.cards = this.createDeck();
    this.burnedCards = [];
    this.shuffle();
  }

  private createDeck(): Card[] {
    const suits: Suit[] = ['h', 'd', 'c', 's'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  }

  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error('Not enough cards in deck');
    }

    const dealtCards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.cards.pop();
      if (card) {
        dealtCards.push(card);
      }
    }
    return dealtCards;
  }

  burn(): Card {
    const card = this.cards.pop();
    if (!card) {
      throw new Error('Not enough cards in deck');
    }
    this.burnedCards.push(card);
    return card;
  }

  reset(): void {
    this.cards = this.createDeck();
    this.burnedCards = [];
    this.shuffle();
  }

  remainingCards(): number {
    return this.cards.length;
  }

  getAllCards(): Card[] {
    return [...this.cards];
  }

  getBurnedCards(): Card[] {
    return [...this.burnedCards];
  }
}
