/**
 * Card suits in poker
 */
export enum Suit {
  Hearts = 'h',
  Diamonds = 'd',
  Clubs = 'c',
  Spades = 's',
}

/**
 * Card ranks in poker (2-A)
 */
export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = 'T',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
}

/**
 * Represents a single playing card
 */
export class Card {
  constructor(
    public readonly rank: Rank,
    public readonly suit: Suit
  ) {}

  /**
   * Returns string representation for pokersolver (e.g., "As", "Kh")
   */
  toString(): string {
    return `${this.rank}${this.suit}`
  }

  /**
   * Returns human-readable representation (e.g., "Ace of Spades")
   */
  toDisplayString(): string {
    const rankNames: Record<Rank, string> = {
      [Rank.Two]: '2',
      [Rank.Three]: '3',
      [Rank.Four]: '4',
      [Rank.Five]: '5',
      [Rank.Six]: '6',
      [Rank.Seven]: '7',
      [Rank.Eight]: '8',
      [Rank.Nine]: '9',
      [Rank.Ten]: '10',
      [Rank.Jack]: 'Jack',
      [Rank.Queen]: 'Queen',
      [Rank.King]: 'King',
      [Rank.Ace]: 'Ace',
    }

    const suitNames: Record<Suit, string> = {
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣',
      [Suit.Spades]: '♠',
    }

    return `${rankNames[this.rank]}${suitNames[this.suit]}`
  }

  /**
   * Checks if two cards are equal
   */
  equals(other: Card): boolean {
    return this.rank === other.rank && this.suit === other.suit
  }

  /**
   * Gets numeric value for comparison (2=2, ..., J=11, Q=12, K=13, A=14)
   */
  getValue(): number {
    const values: Record<Rank, number> = {
      [Rank.Two]: 2,
      [Rank.Three]: 3,
      [Rank.Four]: 4,
      [Rank.Five]: 5,
      [Rank.Six]: 6,
      [Rank.Seven]: 7,
      [Rank.Eight]: 8,
      [Rank.Nine]: 9,
      [Rank.Ten]: 10,
      [Rank.Jack]: 11,
      [Rank.Queen]: 12,
      [Rank.King]: 13,
      [Rank.Ace]: 14,
    }
    return values[this.rank]
  }
}
