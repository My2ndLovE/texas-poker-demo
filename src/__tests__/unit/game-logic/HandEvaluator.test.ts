import { HandEvaluator, HandRank } from '@/game-logic/evaluation/HandEvaluator'
import { Card, Rank, Suit } from '@/game-logic/models/Card'

describe('HandEvaluator', () => {
  let evaluator: HandEvaluator

  beforeEach(() => {
    evaluator = new HandEvaluator()
  })

  describe('evaluateHand', () => {
    it('should throw error for less than 5 cards', () => {
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Spades),
      ]
      expect(() => evaluator.evaluateHand(cards)).toThrow(
        'Hand evaluation requires 5-7 cards'
      )
    })

    it('should throw error for more than 7 cards', () => {
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Spades),
        new Card(Rank.Queen, Suit.Spades),
        new Card(Rank.Jack, Suit.Spades),
        new Card(Rank.Ten, Suit.Spades),
        new Card(Rank.Nine, Suit.Spades),
        new Card(Rank.Eight, Suit.Spades),
        new Card(Rank.Seven, Suit.Spades),
      ]
      expect(() => evaluator.evaluateHand(cards)).toThrow(
        'Hand evaluation requires 5-7 cards'
      )
    })

    describe('Royal Flush', () => {
      it('should identify Royal Flush (A-K-Q-J-T same suit)', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Spades),
          new Card(Rank.King, Suit.Spades),
          new Card(Rank.Queen, Suit.Spades),
          new Card(Rank.Jack, Suit.Spades),
          new Card(Rank.Ten, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.StraightFlush) // pokersolver returns StraightFlush for Royal
        expect(result.description).toBe('Royal Flush')
      })
    })

    describe('Straight Flush', () => {
      it('should identify Straight Flush', () => {
        const cards = [
          new Card(Rank.Nine, Suit.Hearts),
          new Card(Rank.Eight, Suit.Hearts),
          new Card(Rank.Seven, Suit.Hearts),
          new Card(Rank.Six, Suit.Hearts),
          new Card(Rank.Five, Suit.Hearts),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.StraightFlush)
        expect(result.description).toContain('Straight Flush')
      })

      it('should identify wheel straight flush (A-2-3-4-5)', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Clubs),
          new Card(Rank.Two, Suit.Clubs),
          new Card(Rank.Three, Suit.Clubs),
          new Card(Rank.Four, Suit.Clubs),
          new Card(Rank.Five, Suit.Clubs),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.StraightFlush)
        expect(result.description).toContain('Straight Flush')
      })
    })

    describe('Four of a Kind', () => {
      it('should identify Four of a Kind', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Spades),
          new Card(Rank.Ace, Suit.Hearts),
          new Card(Rank.Ace, Suit.Diamonds),
          new Card(Rank.Ace, Suit.Clubs),
          new Card(Rank.King, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.FourOfAKind)
        expect(result.description).toContain('Four of a Kind')
      })
    })

    describe('Full House', () => {
      it('should identify Full House (3 + 2)', () => {
        const cards = [
          new Card(Rank.King, Suit.Spades),
          new Card(Rank.King, Suit.Hearts),
          new Card(Rank.King, Suit.Diamonds),
          new Card(Rank.Ten, Suit.Spades),
          new Card(Rank.Ten, Suit.Hearts),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.FullHouse)
        expect(result.description).toContain('Full House')
      })
    })

    describe('Flush', () => {
      it('should identify Flush (5 same suit)', () => {
        const cards = [
          new Card(Rank.King, Suit.Diamonds),
          new Card(Rank.Jack, Suit.Diamonds),
          new Card(Rank.Nine, Suit.Diamonds),
          new Card(Rank.Seven, Suit.Diamonds),
          new Card(Rank.Five, Suit.Diamonds),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.Flush)
        expect(result.description).toContain('Flush')
      })
    })

    describe('Straight', () => {
      it('should identify Straight (5 consecutive ranks)', () => {
        const cards = [
          new Card(Rank.Nine, Suit.Spades),
          new Card(Rank.Eight, Suit.Hearts),
          new Card(Rank.Seven, Suit.Diamonds),
          new Card(Rank.Six, Suit.Clubs),
          new Card(Rank.Five, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.Straight)
        expect(result.description).toContain('Straight')
      })

      it('should identify wheel straight (A-2-3-4-5)', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Spades),
          new Card(Rank.Two, Suit.Hearts),
          new Card(Rank.Three, Suit.Diamonds),
          new Card(Rank.Four, Suit.Clubs),
          new Card(Rank.Five, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.Straight)
      })

      it('should identify broadway straight (T-J-Q-K-A)', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Spades),
          new Card(Rank.King, Suit.Hearts),
          new Card(Rank.Queen, Suit.Diamonds),
          new Card(Rank.Jack, Suit.Clubs),
          new Card(Rank.Ten, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.Straight)
      })
    })

    describe('Three of a Kind', () => {
      it('should identify Three of a Kind', () => {
        const cards = [
          new Card(Rank.Queen, Suit.Spades),
          new Card(Rank.Queen, Suit.Hearts),
          new Card(Rank.Queen, Suit.Diamonds),
          new Card(Rank.Eight, Suit.Clubs),
          new Card(Rank.Five, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.ThreeOfAKind)
        expect(result.description).toContain('Three of a Kind')
      })
    })

    describe('Two Pair', () => {
      it('should identify Two Pair', () => {
        const cards = [
          new Card(Rank.Jack, Suit.Spades),
          new Card(Rank.Jack, Suit.Hearts),
          new Card(Rank.Nine, Suit.Diamonds),
          new Card(Rank.Nine, Suit.Clubs),
          new Card(Rank.Four, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.TwoPair)
        expect(result.description).toContain('Two Pair')
      })
    })

    describe('One Pair', () => {
      it('should identify One Pair', () => {
        const cards = [
          new Card(Rank.Ten, Suit.Spades),
          new Card(Rank.Ten, Suit.Hearts),
          new Card(Rank.Seven, Suit.Diamonds),
          new Card(Rank.Five, Suit.Clubs),
          new Card(Rank.Three, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.Pair)
        expect(result.description).toContain('Pair')
      })
    })

    describe('High Card', () => {
      it('should identify High Card (no made hand)', () => {
        const cards = [
          new Card(Rank.Ace, Suit.Spades),
          new Card(Rank.King, Suit.Hearts),
          new Card(Rank.Nine, Suit.Diamonds),
          new Card(Rank.Seven, Suit.Clubs),
          new Card(Rank.Three, Suit.Spades),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.HighCard)
        expect(result.description).toContain('High')
      })
    })

    describe('Best 5 from 7 cards', () => {
      it('should find best hand from 7 cards', () => {
        // 7 cards: Royal flush with A-K-Q-J-T of diamonds
        const cards = [
          new Card(Rank.Ace, Suit.Diamonds),
          new Card(Rank.King, Suit.Diamonds),
          new Card(Rank.Queen, Suit.Diamonds),
          new Card(Rank.Jack, Suit.Diamonds),
          new Card(Rank.Ten, Suit.Diamonds),
          new Card(Rank.Eight, Suit.Spades),
          new Card(Rank.Seven, Suit.Hearts),
        ]
        const result = evaluator.evaluateHand(cards)
        expect(result.rank).toBe(HandRank.StraightFlush) // Royal flush
        expect(result.description).toBe('Royal Flush')
      })
    })
  })

  describe('compareHands', () => {
    it('should return 1 when hand1 wins', () => {
      const hand1 = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.Ace, Suit.Hearts),
        new Card(Rank.King, Suit.Diamonds),
        new Card(Rank.Queen, Suit.Clubs),
        new Card(Rank.Jack, Suit.Spades),
      ]
      const hand2 = [
        new Card(Rank.King, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
        new Card(Rank.Queen, Suit.Diamonds),
        new Card(Rank.Jack, Suit.Clubs),
        new Card(Rank.Ten, Suit.Spades),
      ]
      expect(evaluator.compareHands(hand1, hand2)).toBe(1)
    })

    it('should return -1 when hand2 wins', () => {
      const hand1 = [
        new Card(Rank.King, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
        new Card(Rank.Queen, Suit.Diamonds),
        new Card(Rank.Jack, Suit.Clubs),
        new Card(Rank.Ten, Suit.Spades),
      ]
      const hand2 = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.Ace, Suit.Hearts),
        new Card(Rank.King, Suit.Diamonds),
        new Card(Rank.Queen, Suit.Clubs),
        new Card(Rank.Jack, Suit.Spades),
      ]
      expect(evaluator.compareHands(hand1, hand2)).toBe(-1)
    })

    it('should return 0 for tie', () => {
      const hand1 = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
        new Card(Rank.Queen, Suit.Diamonds),
        new Card(Rank.Jack, Suit.Clubs),
        new Card(Rank.Ten, Suit.Spades),
      ]
      const hand2 = [
        new Card(Rank.Ace, Suit.Hearts),
        new Card(Rank.King, Suit.Diamonds),
        new Card(Rank.Queen, Suit.Clubs),
        new Card(Rank.Jack, Suit.Spades),
        new Card(Rank.Ten, Suit.Hearts),
      ]
      expect(evaluator.compareHands(hand1, hand2)).toBe(0)
    })
  })

  describe('findWinners', () => {
    it('should find single winner', () => {
      const playerHands = [
        {
          playerId: 'player1',
          cards: [
            new Card(Rank.Ace, Suit.Spades),
            new Card(Rank.Ace, Suit.Hearts),
            new Card(Rank.King, Suit.Diamonds),
            new Card(Rank.Queen, Suit.Clubs),
            new Card(Rank.Jack, Suit.Spades),
          ],
        },
        {
          playerId: 'player2',
          cards: [
            new Card(Rank.King, Suit.Spades),
            new Card(Rank.King, Suit.Hearts),
            new Card(Rank.Queen, Suit.Diamonds),
            new Card(Rank.Jack, Suit.Clubs),
            new Card(Rank.Ten, Suit.Spades),
          ],
        },
      ]
      const winners = evaluator.findWinners(playerHands)
      expect(winners).toEqual(['player1'])
    })

    it('should find multiple winners on tie', () => {
      const playerHands = [
        {
          playerId: 'player1',
          cards: [
            new Card(Rank.Ace, Suit.Spades),
            new Card(Rank.King, Suit.Hearts),
            new Card(Rank.Queen, Suit.Diamonds),
            new Card(Rank.Jack, Suit.Clubs),
            new Card(Rank.Ten, Suit.Spades),
          ],
        },
        {
          playerId: 'player2',
          cards: [
            new Card(Rank.Ace, Suit.Hearts),
            new Card(Rank.King, Suit.Diamonds),
            new Card(Rank.Queen, Suit.Clubs),
            new Card(Rank.Jack, Suit.Spades),
            new Card(Rank.Ten, Suit.Hearts),
          ],
        },
      ]
      const winners = evaluator.findWinners(playerHands)
      expect(winners).toHaveLength(2)
      expect(winners).toContain('player1')
      expect(winners).toContain('player2')
    })
  })

  describe('getHandRankName', () => {
    it('should return correct name for each rank', () => {
      expect(evaluator.getHandRankName(HandRank.HighCard)).toBe('High Card')
      expect(evaluator.getHandRankName(HandRank.Pair)).toBe('Pair')
      expect(evaluator.getHandRankName(HandRank.TwoPair)).toBe('Two Pair')
      expect(evaluator.getHandRankName(HandRank.ThreeOfAKind)).toBe('Three of a Kind')
      expect(evaluator.getHandRankName(HandRank.Straight)).toBe('Straight')
      expect(evaluator.getHandRankName(HandRank.Flush)).toBe('Flush')
      expect(evaluator.getHandRankName(HandRank.FullHouse)).toBe('Full House')
      expect(evaluator.getHandRankName(HandRank.FourOfAKind)).toBe('Four of a Kind')
      expect(evaluator.getHandRankName(HandRank.StraightFlush)).toBe('Straight Flush')
    })
  })
})
