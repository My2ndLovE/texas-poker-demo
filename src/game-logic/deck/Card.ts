import type { Card as CardType, Rank, Suit } from '@/types';

export class Card implements CardType {
  rank: Rank;
  suit: Suit;
  id: string;

  constructor(rank: Rank, suit: Suit) {
    this.rank = rank;
    this.suit = suit;
    this.id = `${rank}${suit}`;
  }

  /**
   * Returns the card in pokersolver format (e.g., "As", "Kh", "Td")
   */
  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  /**
   * Returns a human-readable card name (e.g., "Ace of Spades")
   */
  toDisplayName(): string {
    const rankNames: Record<Rank, string> = {
      '2': 'Two',
      '3': 'Three',
      '4': 'Four',
      '5': 'Five',
      '6': 'Six',
      '7': 'Seven',
      '8': 'Eight',
      '9': 'Nine',
      T: 'Ten',
      J: 'Jack',
      Q: 'Queen',
      K: 'King',
      A: 'Ace',
    };

    const suitNames: Record<Suit, string> = {
      h: 'Hearts',
      d: 'Diamonds',
      c: 'Clubs',
      s: 'Spades',
    };

    return `${rankNames[this.rank]} of ${suitNames[this.suit]}`;
  }

  /**
   * Returns the suit symbol
   */
  getSuitSymbol(): string {
    const symbols: Record<Suit, string> = {
      h: '♥',
      d: '♦',
      c: '♣',
      s: '♠',
    };
    return symbols[this.suit];
  }

  /**
   * Returns true if the suit is red (hearts or diamonds)
   */
  isRed(): boolean {
    return this.suit === 'h' || this.suit === 'd';
  }

  /**
   * Returns true if the suit is black (clubs or spades)
   */
  isBlack(): boolean {
    return this.suit === 'c' || this.suit === 's';
  }

  /**
   * Compare two cards for equality
   */
  equals(other: CardType): boolean {
    return this.rank === other.rank && this.suit === other.suit;
  }

  /**
   * Create a card from pokersolver format string (e.g., "As", "Kh")
   */
  static fromString(cardString: string): Card {
    if (cardString.length !== 2) {
      throw new Error(`Invalid card string: ${cardString}`);
    }

    const rank = cardString[0] as Rank;
    const suit = cardString[1] as Suit;

    const validRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits: Suit[] = ['h', 'd', 'c', 's'];

    if (!validRanks.includes(rank)) {
      throw new Error(`Invalid rank: ${rank}`);
    }

    if (!validSuits.includes(suit)) {
      throw new Error(`Invalid suit: ${suit}`);
    }

    return new Card(rank, suit);
  }
}
