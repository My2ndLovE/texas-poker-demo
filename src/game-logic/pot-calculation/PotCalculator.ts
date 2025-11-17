/**
 * Represents a player's contribution to the pot
 */
export interface PlayerContribution {
  playerId: string
  amount: number
  isAllIn?: boolean
}

/**
 * Represents a pot (main or side pot)
 */
export interface Pot {
  amount: number
  eligiblePlayers: string[]
  type: 'main' | 'side'
}

/**
 * Handles pot and side pot calculations for Texas Hold'em
 *
 * Algorithm:
 * 1. Sort contributions by amount (ascending)
 * 2. For each unique contribution level:
 *    - Create a pot with that level from all remaining players
 *    - Remove that level from all contributions
 *    - Players who contributed exactly that level are no longer eligible
 */
export class PotCalculator {
  /**
   * Calculate main pot and side pots from player contributions
   */
  calculatePots(contributions: PlayerContribution[]): Pot[] {
    // Filter out players with zero contributions
    const activeContributions = contributions.filter(c => c.amount > 0)

    if (activeContributions.length === 0) {
      return []
    }

    // Sort by contribution amount (ascending)
    const sorted = [...activeContributions].sort((a, b) => a.amount - b.amount)

    const pots: Pot[] = []
    const remaining = new Map<string, number>()

    // Initialize remaining amounts
    sorted.forEach(c => {
      remaining.set(c.playerId, c.amount)
    })

    let currentPlayers = sorted.map(c => c.playerId)
    let previousLevel = 0

    // Process each contribution level
    for (let i = 0; i < sorted.length; i++) {
      const contribution = sorted[i]!
      const currentLevel = contribution.amount

      if (currentLevel > previousLevel) {
        const amountPerPlayer = currentLevel - previousLevel
        const potAmount = amountPerPlayer * currentPlayers.length

        if (potAmount > 0) {
          pots.push({
            amount: potAmount,
            eligiblePlayers: [...currentPlayers],
            type: pots.length === 0 ? 'main' : 'side',
          })
        }

        previousLevel = currentLevel
      }

      // Remove current player from eligible players for next pot
      currentPlayers = currentPlayers.filter(p => p !== contribution.playerId)
    }

    return pots
  }

  /**
   * Get total amount across all pots
   */
  getTotalPotAmount(pots: Pot[]): number {
    return pots.reduce((total, pot) => total + pot.amount, 0)
  }

  /**
   * Get pots that a specific player is eligible to win
   */
  getPlayerEligiblePots(playerId: string, pots: Pot[]): Pot[] {
    return pots.filter(pot => pot.eligiblePlayers.includes(playerId))
  }

  /**
   * Award pot to winner(s)
   * @returns Map of playerId to amount won
   */
  awardPot(pot: Pot, winnerIds: string[]): Map<string, number> {
    const awards = new Map<string, number>()

    // Filter winners to only those eligible for this pot
    const eligibleWinners = winnerIds.filter(id => pot.eligiblePlayers.includes(id))

    if (eligibleWinners.length === 0) {
      // No eligible winners - pot goes to remaining eligible players equally
      // This shouldn't happen in normal play
      return awards
    }

    // Split pot equally among winners
    const amountPerWinner = Math.floor(pot.amount / eligibleWinners.length)
    const remainder = pot.amount % eligibleWinners.length

    eligibleWinners.forEach((winnerId, index) => {
      let amount = amountPerWinner
      // Give remainder to first winner(s) by dealer button position
      if (index < remainder) {
        amount += 1
      }
      awards.set(winnerId, amount)
    })

    return awards
  }

  /**
   * Award all pots to winner(s)
   * @returns Map of playerId to total amount won across all pots
   */
  awardAllPots(pots: Pot[], winnerIdsByPot: string[][]): Map<string, number> {
    const totalAwards = new Map<string, number>()

    pots.forEach((pot, index) => {
      const winners = winnerIdsByPot[index] || []
      const potAwards = this.awardPot(pot, winners)

      potAwards.forEach((amount, playerId) => {
        const currentAmount = totalAwards.get(playerId) || 0
        totalAwards.set(playerId, currentAmount + amount)
      })
    })

    return totalAwards
  }
}
