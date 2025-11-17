import { Card, Rank, Suit } from './Card'

/**
 * Represents a standard 52-card deck
 */
export class Deck {
  private cards: Card[] = []
  private dealtCards: Card[] = []
  private burnedCards: Card[] = []

  constructor() {
    this.initialize()
  }

  /**
   * Initialize deck with 52 cards
   */
  private initialize(): void {
    this.cards = []
    this.dealtCards = []
    this.burnedCards = []

    const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades]
    const ranks = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
      Rank.Ace,
    ]

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(rank, suit))
      }
    }
  }

  /**
   * Shuffle deck using Fisher-Yates algorithm
   */
  shuffle(): void {
    const cards = this.cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j]!, cards[i]!]
    }
  }

  /**
   * Deal a single card from the deck
   * @throws Error if deck is empty
   */
  deal(): Card {
    const card = this.cards.pop()
    if (!card) {
      throw new Error('Cannot deal from empty deck')
    }
    this.dealtCards.push(card)
    return card
  }

  /**
   * Deal multiple cards
   */
  dealMultiple(count: number): Card[] {
    const cards: Card[] = []
    for (let i = 0; i < count; i++) {
      cards.push(this.deal())
    }
    return cards
  }

  /**
   * Burn a card (discard without dealing to player)
   */
  burn(): Card {
    const card = this.cards.pop()
    if (!card) {
      throw new Error('Cannot burn from empty deck')
    }
    this.burnedCards.push(card)
    return card
  }

  /**
   * Reset deck to initial state
   */
  reset(): void {
    this.initialize()
  }

  /**
   * Get number of cards remaining in deck
   */
  remaining(): number {
    return this.cards.length
  }

  /**
   * Get all dealt cards
   */
  getDealtCards(): readonly Card[] {
    return this.dealtCards
  }

  /**
   * Get all burned cards
   */
  getBurnedCards(): readonly Card[] {
    return this.burnedCards
  }

  /**
   * Get all cards currently in deck (for testing)
   */
  getCards(): readonly Card[] {
    return this.cards
  }
}
