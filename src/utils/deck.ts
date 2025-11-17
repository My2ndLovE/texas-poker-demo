/**
 * Deck utility functions
 * Creates and manages a standard 52-card deck
 */

import type { Card, Rank, Suit } from '@/types';

const SUITS: ReadonlyArray<Suit> = ['♠', '♥', '♦', '♣'];
const RANKS: ReadonlyArray<Rank> = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): ReadonlyArray<Card> {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        rank,
        suit,
        id: `${rank}${suit}`,
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: ReadonlyArray<Card>): ReadonlyArray<Card> {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled;
}

/**
 * Deals N cards from the top of the deck
 * Returns [dealtCards, remainingDeck]
 */
export function dealCards(
  deck: ReadonlyArray<Card>,
  count: number
): [ReadonlyArray<Card>, ReadonlyArray<Card>] {
  if (count > deck.length) {
    throw new Error(`Cannot deal ${count} cards from deck with ${deck.length} cards`);
  }

  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);

  return [dealt, remaining];
}

/**
 * Converts card to pokersolver format (e.g., "As", "Kh")
 */
export function cardToPokersolverFormat(card: Card): string {
  const suitMap: Record<Suit, string> = {
    '♠': 's',
    '♥': 'h',
    '♦': 'd',
    '♣': 'c',
  };

  return `${card.rank}${suitMap[card.suit]}`;
}

/**
 * Converts multiple cards to pokersolver format
 */
export function cardsToPokersolverFormat(cards: ReadonlyArray<Card>): string[] {
  return cards.map(cardToPokersolverFormat);
}
