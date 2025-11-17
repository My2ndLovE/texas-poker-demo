import { Deck } from '@/game-logic/models/Deck'
import { Rank, Suit } from '@/game-logic/models/Card'

describe('Deck', () => {
  describe('initialization', () => {
    it('should create a deck with 52 cards', () => {
      const deck = new Deck()
      expect(deck.remaining()).toBe(52)
    })

    it('should contain all 52 unique cards', () => {
      const deck = new Deck()
      const cards = deck.getCards()
      const cardStrings = cards.map(c => c.toString())
      const uniqueCards = new Set(cardStrings)
      expect(uniqueCards.size).toBe(52)
    })

    it('should contain 13 cards of each suit', () => {
      const deck = new Deck()
      const cards = deck.getCards()
      const hearts = cards.filter(c => c.suit === Suit.Hearts)
      const diamonds = cards.filter(c => c.suit === Suit.Diamonds)
      const clubs = cards.filter(c => c.suit === Suit.Clubs)
      const spades = cards.filter(c => c.suit === Suit.Spades)

      expect(hearts.length).toBe(13)
      expect(diamonds.length).toBe(13)
      expect(clubs.length).toBe(13)
      expect(spades.length).toBe(13)
    })

    it('should contain 4 cards of each rank', () => {
      const deck = new Deck()
      const cards = deck.getCards()
      const aces = cards.filter(c => c.rank === Rank.Ace)
      const kings = cards.filter(c => c.rank === Rank.King)
      const twos = cards.filter(c => c.rank === Rank.Two)

      expect(aces.length).toBe(4)
      expect(kings.length).toBe(4)
      expect(twos.length).toBe(4)
    })
  })

  describe('shuffle', () => {
    it('should not change the number of cards', () => {
      const deck = new Deck()
      deck.shuffle()
      expect(deck.remaining()).toBe(52)
    })

    it('should change card order (probabilistic test)', () => {
      const deck1 = new Deck()
      const deck2 = new Deck()

      const before1 = deck1.getCards().map(c => c.toString()).join(',')
      const before2 = deck2.getCards().map(c => c.toString()).join(',')

      deck1.shuffle()
      deck2.shuffle()

      const after1 = deck1.getCards().map(c => c.toString()).join(',')
      const after2 = deck2.getCards().map(c => c.toString()).join(',')

      // Should be different after shuffle
      expect(after1).not.toBe(before1)
      expect(after2).not.toBe(before2)
      // Two shuffles should produce different orders
      expect(after1).not.toBe(after2)
    })
  })

  describe('deal', () => {
    it('should return a card', () => {
      const deck = new Deck()
      const card = deck.deal()
      expect(card).toBeDefined()
      expect(card.rank).toBeDefined()
      expect(card.suit).toBeDefined()
    })

    it('should reduce remaining cards by 1', () => {
      const deck = new Deck()
      const before = deck.remaining()
      deck.deal()
      expect(deck.remaining()).toBe(before - 1)
    })

    it('should add card to dealt cards', () => {
      const deck = new Deck()
      const card = deck.deal()
      const dealtCards = deck.getDealtCards()
      expect(dealtCards).toHaveLength(1)
      expect(dealtCards[0]?.equals(card)).toBe(true)
    })

    it('should throw error when deck is empty', () => {
      const deck = new Deck()
      // Deal all 52 cards
      for (let i = 0; i < 52; i++) {
        deck.deal()
      }
      expect(() => deck.deal()).toThrow('Cannot deal from empty deck')
    })
  })

  describe('dealMultiple', () => {
    it('should deal specified number of cards', () => {
      const deck = new Deck()
      const cards = deck.dealMultiple(5)
      expect(cards).toHaveLength(5)
      expect(deck.remaining()).toBe(47)
    })

    it('should return unique cards', () => {
      const deck = new Deck()
      const cards = deck.dealMultiple(10)
      const cardStrings = cards.map(c => c.toString())
      const uniqueCards = new Set(cardStrings)
      expect(uniqueCards.size).toBe(10)
    })
  })

  describe('burn', () => {
    it('should remove a card from deck', () => {
      const deck = new Deck()
      const before = deck.remaining()
      deck.burn()
      expect(deck.remaining()).toBe(before - 1)
    })

    it('should add card to burned cards', () => {
      const deck = new Deck()
      const card = deck.burn()
      const burnedCards = deck.getBurnedCards()
      expect(burnedCards).toHaveLength(1)
      expect(burnedCards[0]?.equals(card)).toBe(true)
    })

    it('should not add to dealt cards', () => {
      const deck = new Deck()
      deck.burn()
      const dealtCards = deck.getDealtCards()
      expect(dealtCards).toHaveLength(0)
    })

    it('should throw error when deck is empty', () => {
      const deck = new Deck()
      for (let i = 0; i < 52; i++) {
        deck.burn()
      }
      expect(() => deck.burn()).toThrow('Cannot burn from empty deck')
    })
  })

  describe('reset', () => {
    it('should restore deck to 52 cards', () => {
      const deck = new Deck()
      deck.dealMultiple(10)
      deck.burn()
      deck.reset()
      expect(deck.remaining()).toBe(52)
    })

    it('should clear dealt cards', () => {
      const deck = new Deck()
      deck.dealMultiple(5)
      deck.reset()
      expect(deck.getDealtCards()).toHaveLength(0)
    })

    it('should clear burned cards', () => {
      const deck = new Deck()
      deck.burn()
      deck.burn()
      deck.reset()
      expect(deck.getBurnedCards()).toHaveLength(0)
    })
  })

  describe('Fisher-Yates shuffle validation', () => {
    it('should produce reasonably random distribution', () => {
      const iterations = 1000
      const topCardCounts = new Map<string, number>()

      for (let i = 0; i < iterations; i++) {
        const deck = new Deck()
        deck.shuffle()
        const topCard = deck.getCards()[deck.remaining() - 1]
        if (topCard) {
          const key = topCard.toString()
          topCardCounts.set(key, (topCardCounts.get(key) || 0) + 1)
        }
      }

      // Each card should appear roughly iterations/52 times as top card
      // Using loose bounds for statistical variation
      const expected = iterations / 52
      const minExpected = expected * 0.5 // 50% of expected
      const maxExpected = expected * 2.0 // 200% of expected

      let validDistribution = true
      for (const count of topCardCounts.values()) {
        if (count < minExpected || count > maxExpected) {
          validDistribution = false
          break
        }
      }

      expect(validDistribution).toBe(true)
    })
  })
})
