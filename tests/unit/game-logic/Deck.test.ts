import { Deck } from '@/game-logic/deck/Deck';
import { Card } from '@/game-logic/models/Card';

describe('Deck', () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  describe('Initialization', () => {
    it('should create a deck with 52 cards', () => {
      expect(deck.remainingCards()).toBe(52);
    });

    it('should contain all unique cards', () => {
      const cards = deck.getAllCards();
      const cardStrings = cards.map((c) => `${c.rank}${c.suit}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(52);
    });

    it('should contain all 4 suits', () => {
      const cards = deck.getAllCards();
      const suits = cards.map((c) => c.suit);
      expect(suits.filter((s) => s === 'h').length).toBe(13);
      expect(suits.filter((s) => s === 'd').length).toBe(13);
      expect(suits.filter((s) => s === 'c').length).toBe(13);
      expect(suits.filter((s) => s === 's').length).toBe(13);
    });

    it('should contain all 13 ranks per suit', () => {
      const cards = deck.getAllCards();
      const ranks = cards.map((c) => c.rank);
      const expectedRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

      expectedRanks.forEach((rank) => {
        expect(ranks.filter((r) => r === rank).length).toBe(4);
      });
    });
  });

  describe('Shuffle', () => {
    it('should change deck order after shuffle', () => {
      const deck1 = new Deck();
      const deck2 = new Deck();

      const cards1Before = deck1.getAllCards().map(c => `${c.rank}${c.suit}`);
      deck2.shuffle();
      const cards2After = deck2.getAllCards().map(c => `${c.rank}${c.suit}`);

      // Statistically, shuffled deck should be different (not perfect test but good enough)
      let differences = 0;
      for (let i = 0; i < 52; i++) {
        if (cards1Before[i] !== cards2After[i]) differences++;
      }
      expect(differences).toBeGreaterThan(40); // At least 40 cards in different positions
    });

    it('should maintain 52 cards after shuffle', () => {
      deck.shuffle();
      expect(deck.remainingCards()).toBe(52);
    });
  });

  describe('Deal', () => {
    it('should deal specified number of cards', () => {
      const cards = deck.deal(5);
      expect(cards.length).toBe(5);
      expect(deck.remainingCards()).toBe(47);
    });

    it('should deal unique cards', () => {
      const cards = deck.deal(10);
      const cardStrings = cards.map((c) => `${c.rank}${c.suit}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(10);
    });

    it('should remove dealt cards from deck', () => {
      const firstCard = deck.deal(1)[0];
      const remaining = deck.getAllCards();
      expect(remaining.some((c) => c.rank === firstCard.rank && c.suit === firstCard.suit)).toBe(false);
    });

    it('should throw error when dealing more cards than available', () => {
      deck.deal(50);
      expect(() => deck.deal(5)).toThrow('Not enough cards in deck');
    });

    it('should throw error when dealing from empty deck', () => {
      deck.deal(52);
      expect(() => deck.deal(1)).toThrow('Not enough cards in deck');
    });
  });

  describe('Burn', () => {
    it('should burn one card', () => {
      const burnedCard = deck.burn();
      expect(burnedCard).toBeDefined();
      expect(burnedCard.rank).toBeDefined();
      expect(burnedCard.suit).toBeDefined();
      expect(deck.remainingCards()).toBe(51);
    });

    it('should remove burned card from deck', () => {
      const burnedCard = deck.burn();
      const remaining = deck.getAllCards();
      expect(remaining.some((c) => c.rank === burnedCard.rank && c.suit === burnedCard.suit)).toBe(false);
    });

    it('should track burned cards', () => {
      deck.burn();
      deck.burn();
      expect(deck.getBurnedCards().length).toBe(2);
    });
  });

  describe('Reset', () => {
    it('should restore deck to 52 cards', () => {
      deck.deal(20);
      deck.burn();
      deck.reset();
      expect(deck.remainingCards()).toBe(52);
    });

    it('should clear burned cards', () => {
      deck.burn();
      deck.burn();
      deck.reset();
      expect(deck.getBurnedCards().length).toBe(0);
    });

    it('should shuffle after reset', () => {
      const cards1 = deck.getAllCards().map(c => `${c.rank}${c.suit}`);
      deck.reset();
      const cards2 = deck.getAllCards().map(c => `${c.rank}${c.suit}`);

      let differences = 0;
      for (let i = 0; i < 52; i++) {
        if (cards1[i] !== cards2[i]) differences++;
      }
      expect(differences).toBeGreaterThan(40);
    });
  });
});
