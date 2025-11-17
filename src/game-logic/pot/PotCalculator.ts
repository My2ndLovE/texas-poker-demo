import { Player } from '../models/Player';
import { PotStructure, SidePot } from '../models/Pot';
import { PlayerStatus } from '@/utils/constants';

export interface PotResult extends PotStructure {
  mainPotEligiblePlayers: string[];
}

export class PotCalculator {
  calculatePot(players: Player[]): PotResult {
    // Calculate total pot from all bets
    const totalPot = players.reduce((sum, p) => sum + p.totalBet, 0);

    // Get active and all-in players (excluding folded)
    const activePlayers = players.filter(
      (p) => p.status === PlayerStatus.Active || p.status === PlayerStatus.AllIn
    );

    if (activePlayers.length === 0) {
      return {
        mainPot: totalPot,
        sidePots: [],
        totalPot,
        mainPotEligiblePlayers: [],
      };
    }

    // Sort players by total bet (ascending)
    const sorted = [...activePlayers].sort((a, b) => a.totalBet - b.totalBet);

    const pots: Array<{ amount: number; eligiblePlayerIds: string[] }> = [];
    let previousBet = 0;

    // Build pots from smallest bet to largest
    for (let i = 0; i < sorted.length; i++) {
      const currentBet = sorted[i].totalBet;
      const betDifference = currentBet - previousBet;

      if (betDifference > 0) {
        // Number of players eligible for this pot level
        const eligibleCount = sorted.length - i;

        // Calculate pot amount for this level
        const potAmount = betDifference * eligibleCount;

        // All players from this index onwards are eligible
        const eligiblePlayerIds = sorted.slice(i).map((p) => p.id);

        pots.push({
          amount: potAmount,
          eligiblePlayerIds,
        });
      }

      previousBet = currentBet;
    }

    // First pot is main pot, rest are side pots
    const mainPot = pots.length > 0 ? pots[0].amount : 0;
    const mainPotEligiblePlayers = pots.length > 0 ? pots[0].eligiblePlayerIds : [];
    const sidePots: SidePot[] = pots.slice(1);

    return {
      mainPot,
      sidePots,
      totalPot,
      mainPotEligiblePlayers,
    };
  }

  distributePots(
    potResult: PotResult,
    winners: { potIndex: number; playerIds: string[] }[]
  ): Map<string, number> {
    const distribution = new Map<string, number>();

    for (const { potIndex, playerIds } of winners) {
      let potAmount: number;

      if (potIndex === 0) {
        potAmount = potResult.mainPot;
      } else {
        potAmount = potResult.sidePots[potIndex - 1]?.amount ?? 0;
      }

      // Split pot among winners
      const share = Math.floor(potAmount / playerIds.length);
      const remainder = potAmount % playerIds.length;

      for (let i = 0; i < playerIds.length; i++) {
        const playerId = playerIds[i];
        const current = distribution.get(playerId) ?? 0;
        // First winner gets remainder (odd chip rule)
        const amount = i === 0 ? share + remainder : share;
        distribution.set(playerId, current + amount);
      }
    }

    return distribution;
  }
}
