import { Deck } from '@/game-logic/deck/Deck';
import { SUITS, RANKS } from '@/utils/constants';

describe('Deck', () => {
  describe('initialization', () => {
    it('should create a deck with 52 cards', () => {
      const deck = new Deck();
      expect(deck.remainingCards()).toBe(52);
    });

    it('should contain all combinations of ranks and suits', () => {
      const deck = new Deck();
      const cards = deck.getAllCards();

      expect(cards).toHaveLength(52);

      // Check we have 4 of each rank
      for (const rank of RANKS) {
        const cardsOfRank = cards.filter(c => c.rank === rank);
        expect(cardsOfRank).toHaveLength(4);
      }

      // Check we have 13 of each suit
      for (const suit of SUITS) {
        const cardsOfSuit = cards.filter(c => c.suit === suit);
        expect(cardsOfSuit).toHaveLength(13);
      }
    });
  });

  describe('shuffle', () => {
    it('should maintain 52 cards after shuffling', () => {
      const deck = new Deck();
      deck.shuffle();
      expect(deck.remainingCards()).toBe(52);
    });

    it('should change card order', () => {
      const deck1 = new Deck();
      const deck2 = new Deck();

      const before = deck1.getAllCards();
      deck2.shuffle();
      const after = deck2.getAllCards();

      // Highly unlikely to be in same order after shuffle
      let differentCount = 0;
      for (let i = 0; i < before.length; i++) {
        if (before[i].rank !== after[i].rank || before[i].suit !== after[i].suit) {
          differentCount++;
        }
      }

      // At least 80% should be different
      expect(differentCount).toBeGreaterThan(40);
    });
  });

  describe('deal', () => {
    it('should deal the correct number of cards', () => {
      const deck = new Deck();
      deck.shuffle();

      const cards = deck.deal(2);
      expect(cards).toHaveLength(2);
      expect(deck.remainingCards()).toBe(50);
    });

    it('should remove dealt cards from deck', () => {
      const deck = new Deck();
      const firstCard = deck.deal(1)[0];

      const remaining = deck.getAllCards();
      const foundInRemaining = remaining.some(
        c => c.rank === firstCard.rank && c.suit === firstCard.suit
      );

      expect(foundInRemaining).toBe(false);
    });

    it('should throw error when trying to deal more cards than available', () => {
      const deck = new Deck();
      expect(() => deck.deal(53)).toThrow();
    });
  });

  describe('burn', () => {
    it('should remove one card from deck', () => {
      const deck = new Deck();
      deck.shuffle();

      deck.burn();
      expect(deck.remainingCards()).toBe(51);
    });

    it('should throw error when burning from empty deck', () => {
      const deck = new Deck();
      deck.deal(52);

      expect(() => deck.burn()).toThrow();
    });
  });

  describe('reset', () => {
    it('should restore deck to 52 cards', () => {
      const deck = new Deck();
      deck.deal(10);
      deck.burn();

      deck.reset();
      expect(deck.remainingCards()).toBe(52);
    });

    it('should shuffle on reset', () => {
      const deck = new Deck();
      const before = deck.getAllCards();

      deck.reset();
      const after = deck.getAllCards();

      let differentCount = 0;
      for (let i = 0; i < before.length; i++) {
        if (before[i].rank !== after[i].rank || before[i].suit !== after[i].suit) {
          differentCount++;
        }
      }

      // Should be shuffled
      expect(differentCount).toBeGreaterThan(40);
    });
  });
});
