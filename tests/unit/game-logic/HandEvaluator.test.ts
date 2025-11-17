import { HandEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import { stringToCard } from '@/game-logic/models/Card';
import { HandRank } from '@/utils/constants';

describe('HandEvaluator', () => {
  let evaluator: HandEvaluator;

  beforeEach(() => {
    evaluator = new HandEvaluator();
  });

  describe('Royal Flush', () => {
    it('should recognize royal flush', () => {
      const cards = ['Ah', 'Kh', 'Qh', 'Jh', 'Th'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.RoyalFlush);
    });
  });

  describe('Straight Flush', () => {
    it('should recognize straight flush', () => {
      const cards = ['9h', '8h', '7h', '6h', '5h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.StraightFlush);
    });

    it('should recognize wheel straight flush (A-5)', () => {
      const cards = ['5h', '4h', '3h', '2h', 'Ah'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.StraightFlush);
    });
  });

  describe('Four of a Kind', () => {
    it('should recognize four of a kind', () => {
      const cards = ['Ks', 'Kh', 'Kd', 'Kc', 'Ah'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.FourOfAKind);
    });
  });

  describe('Full House', () => {
    it('should recognize full house', () => {
      const cards = ['Ks', 'Kh', 'Kd', 'Ah', 'Ac'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.FullHouse);
    });
  });

  describe('Flush', () => {
    it('should recognize flush', () => {
      const cards = ['Kh', 'Qh', '9h', '6h', '2h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.Flush);
    });
  });

  describe('Straight', () => {
    it('should recognize straight', () => {
      const cards = ['9h', '8s', '7h', '6d', '5h'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.Straight);
    });

    it('should recognize wheel straight (A-5)', () => {
      const cards = ['5h', '4s', '3h', '2d', 'Ah'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.Straight);
    });
  });

  describe('Three of a Kind', () => {
    it('should recognize three of a kind', () => {
      const cards = ['Ks', 'Kh', 'Kd', 'Ah', 'Qc'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.ThreeOfAKind);
    });
  });

  describe('Two Pair', () => {
    it('should recognize two pair', () => {
      const cards = ['Ks', 'Kh', 'Qd', 'Qh', 'Ac'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.TwoPair);
    });
  });

  describe('One Pair', () => {
    it('should recognize one pair', () => {
      const cards = ['Ks', 'Kh', 'Qd', 'Jh', 'Ac'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.OnePair);
    });
  });

  describe('High Card', () => {
    it('should recognize high card', () => {
      const cards = ['Ks', 'Qh', 'Jd', '9h', '7c'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.HighCard);
    });
  });

  describe('7-card evaluation', () => {
    it('should find best 5-card hand from 7 cards', () => {
      // 7 cards including a flush
      const cards = ['Kh', 'Qh', '9h', '6h', '2h', '3s', '4d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      expect(result.rank).toBe(HandRank.Flush);
    });

    it('should find straight over three of a kind', () => {
      // 7 cards: could make 3 of a kind or straight
      const cards = ['8h', '7s', '6h', '5d', '4h', '8s', '8d'].map(stringToCard);
      const result = evaluator.evaluateHand(cards);

      // Straight (8-7-6-5-4) beats three 8s
      expect(result.rank).toBe(HandRank.Straight);
    });
  });

  describe('compareHands', () => {
    it('should determine straight flush beats four of a kind', () => {
      const straightFlush = ['9h', '8h', '7h', '6h', '5h'].map(stringToCard);
      const fourKind = ['Ks', 'Kh', 'Kd', 'Kc', 'Ah'].map(stringToCard);

      const result = evaluator.compareHands(straightFlush, fourKind);
      expect(result).toBe(1); // straightFlush wins
    });

    it('should determine flush beats straight', () => {
      const flush = ['Kh', 'Qh', '9h', '6h', '2h'].map(stringToCard);
      const straight = ['9d', '8s', '7h', '6d', '5h'].map(stringToCard);

      const result = evaluator.compareHands(flush, straight);
      expect(result).toBe(1); // flush wins
    });

    it('should detect tie', () => {
      const hand1 = ['Ah', 'Kh', 'Qh', 'Jh', 'Th'].map(stringToCard);
      const hand2 = ['As', 'Ks', 'Qs', 'Js', 'Ts'].map(stringToCard);

      const result = evaluator.compareHands(hand1, hand2);
      expect(result).toBe(0); // tie
    });
  });
});
