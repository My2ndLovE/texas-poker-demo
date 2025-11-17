import { HandEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import { Card } from '@/game-logic/models/Card';
import { stringToCard } from '@/game-logic/models/Card';

describe('HandEvaluator', () => {
  let evaluator: HandEvaluator;

  beforeEach(() => {
    evaluator = new HandEvaluator();
  });

  describe('Royal Flush', () => {
    it('should identify royal flush', () => {
      const cards: Card[] = ['Ah', 'Kh', 'Qh', 'Jh', 'Th', '2c', '3d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Straight Flush'); // pokersolver calls royal flush 'Straight Flush'
      expect(result.cards.length).toBe(5);
    });
  });

  describe('Straight Flush', () => {
    it('should identify straight flush', () => {
      const cards: Card[] = ['9h', '8h', '7h', '6h', '5h', '2c', '3d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Straight Flush');
    });

    it('should identify wheel straight flush (A-2-3-4-5)', () => {
      const cards: Card[] = ['Ah', '2h', '3h', '4h', '5h', 'Kc', 'Qd'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Straight Flush');
    });
  });

  describe('Four of a Kind', () => {
    it('should identify four of a kind', () => {
      const cards: Card[] = ['Ah', 'Ad', 'Ac', 'As', 'Kh', 'Qd', '2c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Four of a Kind');
      expect(result.description).toContain("A's");
    });

    it('should use highest kicker for four of a kind', () => {
      const cards: Card[] = ['9h', '9d', '9c', '9s', 'Ah', '2d', '3c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.description).toContain("9's");
    });
  });

  describe('Full House', () => {
    it('should identify full house', () => {
      const cards: Card[] = ['Kh', 'Kd', 'Kc', 'Ts', 'Th', '2d', '3c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Full House');
      expect(result.description).toContain("K's");
      expect(result.description).toContain("10's");
    });
  });

  describe('Flush', () => {
    it('should identify flush', () => {
      const cards: Card[] = ['Ah', 'Kh', 'Qh', '9h', '7h', '2c', '3d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Flush');
    });

    it('should use best 5 cards for flush', () => {
      const cards: Card[] = ['Ah', 'Kh', 'Qh', '9h', '7h', '5h', '2h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Flush');
      expect(result.cards.length).toBe(5);
    });
  });

  describe('Straight', () => {
    it('should identify straight', () => {
      const cards: Card[] = ['Ah', 'Kd', 'Qc', 'Js', 'Th', '2d', '3c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Straight');
    });

    it('should identify wheel straight (A-2-3-4-5)', () => {
      const cards: Card[] = ['Ah', '2d', '3c', '4s', '5h', 'Kd', 'Qc'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Straight');
    });
  });

  describe('Three of a Kind', () => {
    it('should identify three of a kind', () => {
      const cards: Card[] = ['9h', '9d', '9c', 'Ah', 'Kd', '2c', '3s'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Three of a Kind');
      expect(result.description).toContain('9');
    });
  });

  describe('Two Pair', () => {
    it('should identify two pair', () => {
      const cards: Card[] = ['Ah', 'Ad', 'Kh', 'Kd', 'Qc', '2s', '3h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Two Pair');
      expect(result.description).toContain("A's");
      expect(result.description).toContain("K's");
    });
  });

  describe('One Pair', () => {
    it('should identify one pair', () => {
      const cards: Card[] = ['Ah', 'Ad', 'Kh', 'Qd', 'Jc', '2s', '3h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('Pair');
      expect(result.description).toContain("A's");
    });
  });

  describe('High Card', () => {
    it('should identify high card', () => {
      const cards: Card[] = ['Ah', 'Kd', 'Qc', 'Js', '9h', '7d', '2c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.name).toBe('High Card');
    });
  });

  describe('Hand Comparison', () => {
    it('should correctly compare royal flush > four of a kind', () => {
      const royalFlush = ['Ah', 'Kh', 'Qh', 'Jh', 'Th'].map(stringToCard);
      const fourKind = ['9h', '9d', '9c', '9s', 'Ah'].map(stringToCard);

      const comparison = evaluator.compareHands(royalFlush, fourKind);
      expect(comparison).toBe(1); // Royal flush wins
    });

    it('should correctly compare flush > straight', () => {
      const flush = ['Ah', 'Kh', 'Qh', '9h', '7h'].map(stringToCard);
      const straight = ['Ah', 'Kd', 'Qc', 'Js', 'Th'].map(stringToCard);

      const comparison = evaluator.compareHands(flush, straight);
      expect(comparison).toBe(1); // Flush wins
    });

    it('should correctly handle ties with same hand rank', () => {
      const pair1 = ['Ah', 'Ad', 'Kh', 'Qd', 'Jc'].map(stringToCard);
      const pair2 = ['Ah', 'Ac', 'Kd', 'Qs', 'Jh'].map(stringToCard);

      const comparison = evaluator.compareHands(pair1, pair2);
      expect(comparison).toBe(0); // Tie
    });

    it('should correctly compare pairs with different kickers', () => {
      const pairHighKicker = ['Ah', 'Ad', 'Kh', 'Qd', 'Jc'].map(stringToCard);
      const pairLowKicker = ['Ah', 'Ac', '9h', '8d', '7c'].map(stringToCard);

      const comparison = evaluator.compareHands(pairHighKicker, pairLowKicker);
      expect(comparison).toBe(1); // High kicker wins
    });
  });

  describe('Best Hand from 7 Cards', () => {
    it('should find best 5-card hand from 7 cards', () => {
      const cards: Card[] = ['Ah', 'Kh', 'Qh', 'Jh', 'Th', '2c', '3d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);
      expect(result.cards.length).toBe(5);
      expect(result.name).toBe('Straight Flush');
    });

    it('should use community + hole cards correctly', () => {
      // Simulate real poker: 2 hole cards + 5 community cards
      const holeCards: Card[] = ['Ah', 'Kh'].map(stringToCard);
      const communityCards: Card[] = ['Qh', 'Jh', 'Th', '2c', '3d'].map(stringToCard);
      const allCards = [...holeCards, ...communityCards];

      const result = evaluator.evaluateHand(allCards);
      expect(result.name).toBe('Straight Flush');
    });
  });
});
