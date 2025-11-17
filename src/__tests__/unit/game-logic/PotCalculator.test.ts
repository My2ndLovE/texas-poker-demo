import { PotCalculator, PlayerContribution } from '../../../game-logic/pot-calculation/PotCalculator'

describe('PotCalculator', () => {
  let calculator: PotCalculator

  beforeEach(() => {
    calculator = new PotCalculator()
  })

  describe('Main pot calculation', () => {
    it('should create a single main pot with equal contributions', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 100 },
        { playerId: 'p2', amount: 100 },
        { playerId: 'p3', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(1)
      expect(pots[0]!.amount).toBe(300)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p2', 'p3'])
      expect(pots[0]!.type).toBe('main')
    })

    it('should handle two players with equal contributions', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 50 },
        { playerId: 'p2', amount: 50 },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(1)
      expect(pots[0]!.amount).toBe(100)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p2'])
    })

    it('should handle zero contributions', () => {
      const contributions: PlayerContribution[] = []
      const pots = calculator.calculatePots(contributions)
      expect(pots).toHaveLength(0)
    })
  })

  describe('Side pot calculation', () => {
    it('should create side pot when one player goes all-in', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 50, isAllIn: true },
        { playerId: 'p2', amount: 100 },
        { playerId: 'p3', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(2)

      // Main pot: 50 from each player
      expect(pots[0]!.amount).toBe(150)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p2', 'p3'])
      expect(pots[0]!.type).toBe('main')

      // Side pot: remaining 50 from p2 and p3
      expect(pots[1]!.amount).toBe(100)
      expect(pots[1]!.eligiblePlayers).toEqual(['p2', 'p3'])
      expect(pots[1]!.type).toBe('side')
    })

    it('should handle multiple all-ins with different amounts', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 30, isAllIn: true },
        { playerId: 'p2', amount: 70, isAllIn: true },
        { playerId: 'p3', amount: 100 },
        { playerId: 'p4', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(3)

      // Main pot: 30 from each player (4 * 30 = 120)
      expect(pots[0]!.amount).toBe(120)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p2', 'p3', 'p4'])
      expect(pots[0]!.type).toBe('main')

      // Side pot 1: 40 more from p2, p3, p4 (3 * 40 = 120)
      expect(pots[1]!.amount).toBe(120)
      expect(pots[1]!.eligiblePlayers).toEqual(['p2', 'p3', 'p4'])
      expect(pots[1]!.type).toBe('side')

      // Side pot 2: 30 more from p3, p4 (2 * 30 = 60)
      expect(pots[2]!.amount).toBe(60)
      expect(pots[2]!.eligiblePlayers).toEqual(['p3', 'p4'])
      expect(pots[2]!.type).toBe('side')
    })

    it('should handle all players going all-in with different amounts', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 20, isAllIn: true },
        { playerId: 'p2', amount: 50, isAllIn: true },
        { playerId: 'p3', amount: 100, isAllIn: true },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(3)

      // Main pot: 20 * 3 = 60
      expect(pots[0]!.amount).toBe(60)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p2', 'p3'])

      // Side pot 1: 30 * 2 = 60
      expect(pots[1]!.amount).toBe(60)
      expect(pots[1]!.eligiblePlayers).toEqual(['p2', 'p3'])

      // Side pot 2: 50 * 1 = 50
      expect(pots[2]!.amount).toBe(50)
      expect(pots[2]!.eligiblePlayers).toEqual(['p3'])
    })
  })

  describe('Edge cases', () => {
    it('should handle single player contribution', () => {
      const contributions: PlayerContribution[] = [{ playerId: 'p1', amount: 100 }]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(1)
      expect(pots[0]!.amount).toBe(100)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1'])
    })

    it('should handle players with zero contributions', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 100 },
        { playerId: 'p2', amount: 0 },
        { playerId: 'p3', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)

      expect(pots).toHaveLength(1)
      expect(pots[0]!.amount).toBe(200)
      expect(pots[0]!.eligiblePlayers).toEqual(['p1', 'p3'])
    })

    it('should order pots from main to side pots correctly', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 100 },
        { playerId: 'p2', amount: 50, isAllIn: true },
        { playerId: 'p3', amount: 75, isAllIn: true },
      ]

      const pots = calculator.calculatePots(contributions)

      // Verify pots are ordered correctly
      expect(pots[0]!.type).toBe('main')
      pots.slice(1).forEach(pot => {
        expect(pot.type).toBe('side')
      })
    })
  })

  describe('getTotalPotAmount', () => {
    it('should return total amount across all pots', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 30, isAllIn: true },
        { playerId: 'p2', amount: 70, isAllIn: true },
        { playerId: 'p3', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)
      const total = calculator.getTotalPotAmount(pots)

      expect(total).toBe(200) // 30 + 70 + 100
    })

    it('should return 0 for empty pots array', () => {
      const total = calculator.getTotalPotAmount([])
      expect(total).toBe(0)
    })
  })

  describe('getPlayerEligiblePots', () => {
    it('should return pots a player is eligible for', () => {
      const contributions: PlayerContribution[] = [
        { playerId: 'p1', amount: 50, isAllIn: true },
        { playerId: 'p2', amount: 100 },
        { playerId: 'p3', amount: 100 },
      ]

      const pots = calculator.calculatePots(contributions)

      const p1Pots = calculator.getPlayerEligiblePots('p1', pots)
      const p2Pots = calculator.getPlayerEligiblePots('p2', pots)

      expect(p1Pots).toHaveLength(1) // Only main pot
      expect(p2Pots).toHaveLength(2) // Main pot + side pot
    })
  })
})
