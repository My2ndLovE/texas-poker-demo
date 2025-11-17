import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards, cardToPokersolverFormat } from '@/utils/deck';

describe('Deck Utils', () => {
  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have 13 cards of each suit', () => {
      const deck = createDeck();
      const spades = deck.filter((card) => card.suit === '♠');
      const hearts = deck.filter((card) => card.suit === '♥');
      const diamonds = deck.filter((card) => card.suit === '♦');
      const clubs = deck.filter((card) => card.suit === '♣');

      expect(spades).toHaveLength(13);
      expect(hearts).toHaveLength(13);
      expect(diamonds).toHaveLength(13);
      expect(clubs).toHaveLength(13);
    });

    it('should have 4 cards of each rank', () => {
      const deck = createDeck();
      const aces = deck.filter((card) => card.rank === 'A');
      const kings = deck.filter((card) => card.rank === 'K');

      expect(aces).toHaveLength(4);
      expect(kings).toHaveLength(4);
    });

    it('should have unique card IDs', () => {
      const deck = createDeck();
      const ids = deck.map((card) => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      expect(shuffled).toHaveLength(52);

      // Check that all original cards are present
      const originalIds = deck.map((c) => c.id).sort();
      const shuffledIds = shuffled.map((c) => c.id).sort();

      expect(shuffledIds).toEqual(originalIds);
    });

    it('should produce a different order (statistically)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      // Check if at least some cards are in different positions
      let differentPositions = 0;
      for (let i = 0; i < deck.length; i++) {
        if (deck[i]!.id !== shuffled[i]!.id) {
          differentPositions++;
        }
      }

      // Expect at least 40 cards in different positions (76%)
      expect(differentPositions).toBeGreaterThan(40);
    });
  });

  describe('dealCards', () => {
    it('should deal the requested number of cards', () => {
      const deck = createDeck();
      const [dealt, remaining] = dealCards(deck, 5);

      expect(dealt).toHaveLength(5);
      expect(remaining).toHaveLength(47);
    });

    it('should deal cards from the top of the deck', () => {
      const deck = createDeck();
      const [dealt] = dealCards(deck, 3);

      expect(dealt[0]).toEqual(deck[0]);
      expect(dealt[1]).toEqual(deck[1]);
      expect(dealt[2]).toEqual(deck[2]);
    });

    it('should throw error if dealing more cards than available', () => {
      const deck = createDeck();

      expect(() => dealCards(deck, 53)).toThrow();
    });
  });

  describe('cardToPokersolverFormat', () => {
    it('should convert cards to pokersolver format', () => {
      const aceOfSpades = { rank: 'A' as const, suit: '♠' as const, id: 'A♠' };
      const kingOfHearts = { rank: 'K' as const, suit: '♥' as const, id: 'K♥' };

      expect(cardToPokersolverFormat(aceOfSpades)).toBe('As');
      expect(cardToPokersolverFormat(kingOfHearts)).toBe('Kh');
    });
  });
});
