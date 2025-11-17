import { Pot, PotStructure } from '../models/Pot';

interface PlayerBet {
  playerId: string;
  bet: number;
  isAllIn: boolean;
  isFolded: boolean;
}

export class PotCalculator {
  calculatePots(players: PlayerBet[]): PotStructure {
    if (players.length === 0) {
      return {
        mainPot: { amount: 0, eligiblePlayerIds: [] },
        sidePots: [],
        totalPot: 0,
      };
    }

    // Calculate total pot
    const totalPot = players.reduce((sum, p) => sum + p.bet, 0);

    // Filter out folded players for eligibility
    const activePlayers = players.filter((p) => !p.isFolded);

    if (activePlayers.length === 0) {
      return {
        mainPot: { amount: totalPot, eligiblePlayerIds: [] },
        sidePots: [],
        totalPot,
      };
    }

    // Sort all players (including folded) by bet amount for calculating contributions
    const sortedAllPlayers = [...players].sort((a, b) => a.bet - b.bet);

    // Sort active players by bet amount for determining eligibility
    const sortedActivePlayers = [...activePlayers].sort((a, b) => a.bet - b.bet);

    // Build pots
    const pots: Pot[] = [];
    let previousBetLevel = 0;

    // Get unique bet levels from active players only
    const uniqueBetLevels = Array.from(
      new Set(sortedActivePlayers.map(p => p.bet))
    ).sort((a, b) => a - b);

    for (const currentBetLevel of uniqueBetLevels) {
      const betDifference = currentBetLevel - previousBetLevel;

      if (betDifference === 0) {
        continue;
      }

      // Count ALL players (including folded) who bet at least currentBetLevel
      // These players contribute to this pot level
      const contributingPlayers = sortedAllPlayers.filter(p => p.bet >= currentBetLevel);

      // Only ACTIVE players who bet at least currentBetLevel are eligible to win
      const eligiblePlayers = sortedActivePlayers.filter(p => p.bet >= currentBetLevel);
      const eligiblePlayerIds = eligiblePlayers.map((p) => p.playerId).sort();

      // Calculate pot amount: betDifference * number of players who contributed at this level
      const potAmount = betDifference * contributingPlayers.length;

      pots.push({
        amount: potAmount,
        eligiblePlayerIds,
      });

      previousBetLevel = currentBetLevel;
    }

    // Separate main pot from side pots
    const mainPot = pots.length > 0 ? pots[0] : { amount: 0, eligiblePlayerIds: [] };
    const sidePots = pots.slice(1);

    return {
      mainPot,
      sidePots,
      totalPot,
    };
  }

  /**
   * Distributes pot(s) to winners
   * Returns map of playerId -> chips won
   */
  distributePots(potStructure: PotStructure, winners: string[]): Map<string, number> {
    const distribution = new Map<string, number>();

    // Initialize all winners with 0
    winners.forEach((winnerId) => distribution.set(winnerId, 0));

    // Distribute main pot
    this.distributeSinglePot(potStructure.mainPot, winners, distribution);

    // Distribute side pots
    potStructure.sidePots.forEach((sidePot) => {
      this.distributeSinglePot(sidePot, winners, distribution);
    });

    return distribution;
  }

  private distributeSinglePot(pot: Pot, winners: string[], distribution: Map<string, number>): void {
    // Find winners eligible for this pot
    const eligibleWinners = winners.filter((winnerId) =>
      pot.eligiblePlayerIds.includes(winnerId)
    );

    if (eligibleWinners.length === 0) {
      // If no winners are eligible, find the best hand among eligible players
      // This would require hand comparison, which is handled at a higher level
      // For now, distribute to first eligible player
      const firstEligible = pot.eligiblePlayerIds[0];
      if (firstEligible) {
        const currentAmount = distribution.get(firstEligible) || 0;
        distribution.set(firstEligible, currentAmount + pot.amount);
      }
      return;
    }

    // Split pot among eligible winners
    const amountPerWinner = Math.floor(pot.amount / eligibleWinners.length);
    const remainder = pot.amount % eligibleWinners.length;

    eligibleWinners.forEach((winnerId, index) => {
      const currentAmount = distribution.get(winnerId) || 0;
      let wonAmount = amountPerWinner;

      // Give odd chip to first winner (closest to dealer button in real game)
      if (index === 0 && remainder > 0) {
        wonAmount += remainder;
      }

      distribution.set(winnerId, currentAmount + wonAmount);
    });
  }
}
