import type { Player, PotStructure, SidePot } from '@/types';

/**
 * PotCalculator handles main pot and side pot calculations
 * Side pots are created when players go all-in with different chip amounts
 */
export class PotCalculator {
  /**
   * Calculate pot structure from player bets
   * @param players Array of all players in the hand
   * @returns PotStructure with main pot, side pots, and total
   */
  calculatePots(players: Player[]): PotStructure {
    // Get all players who have bet money (including folded - their chips stay in pot!)
    const playersWithBets = players.filter((p) => p.totalBet > 0);

    if (playersWithBets.length === 0) {
      return {
        mainPot: 0,
        sidePots: [],
        totalPot: 0,
      };
    }

    // Sort ALL players with bets by total bet amount (ascending)
    const sortedPlayers = [...playersWithBets].sort((a, b) => a.totalBet - b.totalBet);

    const pots: SidePot[] = [];
    let previousBet = 0;

    // Create pots iteratively
    for (let i = 0; i < sortedPlayers.length; i++) {
      const currentBet = sortedPlayers[i].totalBet;
      const contribution = currentBet - previousBet;

      if (contribution > 0) {
        // Count ALL players (including folded) who contributed to this level
        const contributingPlayers = sortedPlayers.slice(i);
        const potAmount = contribution * contributingPlayers.length;

        // But only NON-FOLDED players are eligible to win
        const eligiblePlayers = contributingPlayers.filter((p) => p.status !== 'folded');

        pots.push({
          amount: potAmount,
          eligiblePlayerIds: eligiblePlayers.map((p) => p.id),
        });
      }

      previousBet = currentBet;
    }

    // The first pot is the main pot, rest are side pots
    const mainPot = pots.length > 0 ? pots[0].amount : 0;
    const sidePots = pots.slice(1);
    const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);

    return {
      mainPot,
      sidePots,
      totalPot,
    };
  }

  /**
   * Distribute a specific pot to winner(s)
   * @param pot Pot to distribute
   * @param winnerIds Array of winner player IDs
   * @param dealerIndex Index of dealer (for odd chip distribution)
   * @param players All players (for seat order)
   * @returns Map of playerId to chips won
   */
  distributePot(
    pot: SidePot,
    winnerIds: string[],
    dealerIndex: number,
    players: Player[],
  ): Map<string, number> {
    const distribution = new Map<string, number>();

    // Filter winners who are eligible for this pot
    const eligibleWinners = winnerIds.filter((id) => pot.eligiblePlayerIds.includes(id));

    if (eligibleWinners.length === 0) {
      // No eligible winners, pot stays (shouldn't happen in normal game)
      return distribution;
    }

    // Calculate chips per winner
    const chipsPerWinner = Math.floor(pot.amount / eligibleWinners.length);
    const oddChips = pot.amount % eligibleWinners.length;

    // Give each winner their share
    for (const winnerId of eligibleWinners) {
      distribution.set(winnerId, chipsPerWinner);
    }

    // Distribute odd chips to player(s) closest to dealer button (clockwise)
    if (oddChips > 0) {
      const winnerWithOddChip = this.getPlayerClosestToDealer(
        eligibleWinners,
        dealerIndex,
        players,
      );
      if (winnerWithOddChip) {
        const currentAmount = distribution.get(winnerWithOddChip) || 0;
        distribution.set(winnerWithOddChip, currentAmount + oddChips);
      }
    }

    return distribution;
  }

  /**
   * Get the player closest to the dealer button (clockwise)
   * Used for distributing odd chips
   */
  private getPlayerClosestToDealer(
    playerIds: string[],
    dealerIndex: number,
    allPlayers: Player[],
  ): string | null {
    if (playerIds.length === 0) {
      return null;
    }

    // Create a map of playerId to seatIndex
    const seatMap = new Map<string, number>();
    for (const player of allPlayers) {
      seatMap.set(player.id, player.seatIndex);
    }

    // Find distances from dealer for each player (clockwise)
    const distances = playerIds.map((id) => {
      const seatIndex = seatMap.get(id);
      if (seatIndex === undefined) {
        return { id, distance: Number.POSITIVE_INFINITY };
      }

      // Calculate clockwise distance from dealer
      let distance = seatIndex - dealerIndex;
      if (distance < 0) {
        distance += allPlayers.length;
      }

      return { id, distance };
    });

    // Sort by distance (closest first)
    distances.sort((a, b) => a.distance - b.distance);

    return distances[0].id;
  }

  /**
   * Get total pot amount from all players
   */
  getTotalPot(players: Player[]): number {
    return players.reduce((sum, player) => sum + player.totalBet, 0);
  }

  /**
   * Validate pot calculations (for testing/debugging)
   * Ensures total pot equals sum of all player bets
   */
  validatePots(potStructure: PotStructure, players: Player[]): boolean {
    const totalPlayerBets = this.getTotalPot(players);
    return potStructure.totalPot === totalPlayerBets;
  }
}

// Singleton instance
export const potCalculator = new PotCalculator();
