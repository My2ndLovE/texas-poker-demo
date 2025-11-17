import { Card, Rank, Suit } from '@/game-logic/models/Card'

describe('Card', () => {
  describe('constructor', () => {
    it('should create a card with rank and suit', () => {
      const card = new Card(Rank.Ace, Suit.Spades)
      expect(card.rank).toBe(Rank.Ace)
      expect(card.suit).toBe(Suit.Spades)
    })
  })

  describe('toString', () => {
    it('should return pokersolver format for Ace of Spades', () => {
      const card = new Card(Rank.Ace, Suit.Spades)
      expect(card.toString()).toBe('As')
    })

    it('should return pokersolver format for King of Hearts', () => {
      const card = new Card(Rank.King, Suit.Hearts)
      expect(card.toString()).toBe('Kh')
    })

    it('should return pokersolver format for Two of Clubs', () => {
      const card = new Card(Rank.Two, Suit.Clubs)
      expect(card.toString()).toBe('2c')
    })

    it('should return pokersolver format for Ten of Diamonds', () => {
      const card = new Card(Rank.Ten, Suit.Diamonds)
      expect(card.toString()).toBe('Td')
    })
  })

  describe('toDisplayString', () => {
    it('should return human-readable format for Ace of Spades', () => {
      const card = new Card(Rank.Ace, Suit.Spades)
      expect(card.toDisplayString()).toBe('Ace♠')
    })

    it('should return human-readable format for King of Hearts', () => {
      const card = new Card(Rank.King, Suit.Hearts)
      expect(card.toDisplayString()).toBe('King♥')
    })

    it('should return human-readable format for 2 of Clubs', () => {
      const card = new Card(Rank.Two, Suit.Clubs)
      expect(card.toDisplayString()).toBe('2♣')
    })

    it('should return human-readable format for 10 of Diamonds', () => {
      const card = new Card(Rank.Ten, Suit.Diamonds)
      expect(card.toDisplayString()).toBe('10♦')
    })
  })

  describe('equals', () => {
    it('should return true for identical cards', () => {
      const card1 = new Card(Rank.Ace, Suit.Spades)
      const card2 = new Card(Rank.Ace, Suit.Spades)
      expect(card1.equals(card2)).toBe(true)
    })

    it('should return false for different ranks', () => {
      const card1 = new Card(Rank.Ace, Suit.Spades)
      const card2 = new Card(Rank.King, Suit.Spades)
      expect(card1.equals(card2)).toBe(false)
    })

    it('should return false for different suits', () => {
      const card1 = new Card(Rank.Ace, Suit.Spades)
      const card2 = new Card(Rank.Ace, Suit.Hearts)
      expect(card1.equals(card2)).toBe(false)
    })
  })

  describe('getValue', () => {
    it('should return 2 for Two', () => {
      const card = new Card(Rank.Two, Suit.Spades)
      expect(card.getValue()).toBe(2)
    })

    it('should return 10 for Ten', () => {
      const card = new Card(Rank.Ten, Suit.Hearts)
      expect(card.getValue()).toBe(10)
    })

    it('should return 11 for Jack', () => {
      const card = new Card(Rank.Jack, Suit.Clubs)
      expect(card.getValue()).toBe(11)
    })

    it('should return 12 for Queen', () => {
      const card = new Card(Rank.Queen, Suit.Diamonds)
      expect(card.getValue()).toBe(12)
    })

    it('should return 13 for King', () => {
      const card = new Card(Rank.King, Suit.Spades)
      expect(card.getValue()).toBe(13)
    })

    it('should return 14 for Ace', () => {
      const card = new Card(Rank.Ace, Suit.Hearts)
      expect(card.getValue()).toBe(14)
    })
  })
})
