import { Player } from '../../../game-logic/models/Player'
import { Card, Rank, Suit } from '../../../game-logic/models/Card'

describe('Player', () => {
  describe('constructor', () => {
    it('should create a player with initial values', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(player.id).toBe('p1')
      expect(player.name).toBe('Alice')
      expect(player.chips).toBe(1000)
      expect(player.status).toBe('active')
      expect(player.holeCards).toEqual([])
      expect(player.currentBet).toBe(0)
      expect(player.totalBet).toBe(0)
      expect(player.isDealer).toBe(false)
      expect(player.isSmallBlind).toBe(false)
      expect(player.isBigBlind).toBe(false)
    })

    it('should create a bot player', () => {
      const player = new Player('bot1', 'Bot Alice', 1000, { isBot: true, difficulty: 'medium' })

      expect(player.isBot).toBe(true)
      expect(player.botDifficulty).toBe('medium')
    })
  })

  describe('dealCards', () => {
    it('should set hole cards', () => {
      const player = new Player('p1', 'Alice', 1000)
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
      ]

      player.dealCards(cards)

      expect(player.holeCards).toEqual(cards)
    })

    it('should throw error if not exactly 2 cards', () => {
      const player = new Player('p1', 'Alice', 1000)
      const cards = [new Card(Rank.Ace, Suit.Spades)]

      expect(() => player.dealCards(cards)).toThrow('Must deal exactly 2 hole cards')
    })
  })

  describe('bet', () => {
    it('should place a bet and deduct from chips', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.bet(100)

      expect(player.chips).toBe(900)
      expect(player.currentBet).toBe(100)
      expect(player.totalBet).toBe(100)
    })

    it('should accumulate bets across multiple actions', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.bet(50)
      player.bet(100)

      expect(player.chips).toBe(850)
      expect(player.currentBet).toBe(150)
      expect(player.totalBet).toBe(150)
    })

    it('should throw error if bet exceeds chips', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(() => player.bet(1001)).toThrow('Insufficient chips')
    })

    it('should set status to all-in when betting all chips', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.bet(1000)

      expect(player.status).toBe('all-in')
      expect(player.chips).toBe(0)
    })
  })

  describe('fold', () => {
    it('should set status to folded', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.fold()

      expect(player.status).toBe('folded')
    })

    it('should not change chips', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.fold()

      expect(player.chips).toBe(1000)
    })
  })

  describe('resetForNewRound', () => {
    it('should reset player for new betting round', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.bet(100)

      player.resetForNewRound()

      expect(player.currentBet).toBe(0)
      expect(player.totalBet).toBe(100) // Total bet persists
      expect(player.hasActed).toBe(false)
    })

    it('should not reset folded status', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.fold()

      player.resetForNewRound()

      expect(player.status).toBe('folded')
    })
  })

  describe('resetForNewHand', () => {
    it('should completely reset player for new hand', () => {
      const player = new Player('p1', 'Alice', 1000)
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
      ]
      player.dealCards(cards)
      player.bet(100)
      player.fold()

      player.resetForNewHand()

      expect(player.holeCards).toEqual([])
      expect(player.currentBet).toBe(0)
      expect(player.totalBet).toBe(0)
      expect(player.status).toBe('active')
      expect(player.hasActed).toBe(false)
      expect(player.isDealer).toBe(false)
      expect(player.isSmallBlind).toBe(false)
      expect(player.isBigBlind).toBe(false)
    })

    it('should keep chips amount', () => {
      const player = new Player('p1', 'Alice', 900)

      player.resetForNewHand()

      expect(player.chips).toBe(900)
    })
  })

  describe('addChips', () => {
    it('should add chips to player stack', () => {
      const player = new Player('p1', 'Alice', 1000)

      player.addChips(500)

      expect(player.chips).toBe(1500)
    })

    it('should throw error for negative amount', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(() => player.addChips(-100)).toThrow('Amount must be positive')
    })
  })

  describe('canAct', () => {
    it('should return true for active player', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(player.canAct()).toBe(true)
    })

    it('should return false for folded player', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.fold()

      expect(player.canAct()).toBe(false)
    })

    it('should return false for all-in player', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.bet(1000)

      expect(player.canAct()).toBe(false)
    })

    it('should return false for sitting out player', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.status = 'sitting-out'

      expect(player.canAct()).toBe(false)
    })
  })

  describe('hasCards', () => {
    it('should return true when player has hole cards', () => {
      const player = new Player('p1', 'Alice', 1000)
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
      ]
      player.dealCards(cards)

      expect(player.hasCards()).toBe(true)
    })

    it('should return false when player has no hole cards', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(player.hasCards()).toBe(false)
    })
  })

  describe('getAvailableChips', () => {
    it('should return chips amount', () => {
      const player = new Player('p1', 'Alice', 1000)

      expect(player.getAvailableChips()).toBe(1000)
    })

    it('should return chips after betting', () => {
      const player = new Player('p1', 'Alice', 1000)
      player.bet(300)

      expect(player.getAvailableChips()).toBe(700)
    })
  })

  describe('clone', () => {
    it('should create a deep copy of player', () => {
      const player = new Player('p1', 'Alice', 1000)
      const cards = [
        new Card(Rank.Ace, Suit.Spades),
        new Card(Rank.King, Suit.Hearts),
      ]
      player.dealCards(cards)
      player.bet(100)

      const clone = player.clone()

      expect(clone.id).toBe(player.id)
      expect(clone.name).toBe(player.name)
      expect(clone.chips).toBe(player.chips)
      expect(clone.currentBet).toBe(player.currentBet)
      expect(clone.holeCards).toEqual(player.holeCards)

      // Verify it's a deep copy
      clone.chips = 500
      expect(player.chips).toBe(900)
    })
  })
})
