import { Player, isPlayerInHand } from '../models/Player';
import { PotStructure, SidePot } from '../models/Pot';

export class PotCalculator {
  // Calculate main pot and side pots from player bets
  calculatePots(players: Player[]): PotStructure {
    // Filter active players (not folded, have bet)
    const activePlayers = players.filter(
      (p) => isPlayerInHand(p) && p.totalBet > 0
    );

    if (activePlayers.length === 0) {
      return { mainPot: 0, sidePots: [], totalPot: 0 };
    }

    // Sort by total bet amount (ascending)
    const sorted = [...activePlayers].sort((a, b) => a.totalBet - b.totalBet);

    const pots: SidePot[] = [];
    let previousBet = 0;

    for (let i = 0; i < sorted.length; i++) {
      const currentBet = sorted[i].totalBet;
      const contribution = currentBet - previousBet;

      if (contribution > 0) {
        // Players from index i onwards are eligible
        const eligiblePlayers = sorted.slice(i);
        const potAmount = contribution * eligiblePlayers.length;

        pots.push({
          amount: potAmount,
          eligiblePlayerIds: eligiblePlayers.map((p) => p.id),
        });
      }

      previousBet = currentBet;
    }

    const mainPot = pots.length > 0 ? pots[0].amount : 0;
    const sidePots = pots.slice(1);
    const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);

    return {
      mainPot,
      sidePots,
      totalPot,
    };
  }

  // Distribute pots to winners
  distributePots(
    pot: PotStructure,
    winners: { playerId: string; handValue: number }[]
  ): Map<string, number> {
    const winnings = new Map<string, number>();

    // Helper to distribute a single pot
    const distributePot = (potAmount: number, eligibleWinners: string[]) => {
      if (eligibleWinners.length === 0) return;

      const amountPerWinner = Math.floor(potAmount / eligibleWinners.length);
      const remainder = potAmount % eligibleWinners.length;

      for (let i = 0; i < eligibleWinners.length; i++) {
        const playerId = eligibleWinners[i];
        const current = winnings.get(playerId) || 0;
        let share = amountPerWinner;

        // Give odd chips to first winner (closest to button)
        if (i === 0) {
          share += remainder;
        }

        winnings.set(playerId, current + share);
      }
    };

    // Distribute main pot
    if (pot.mainPot > 0) {
      const mainPotWinners = winners.map((w) => w.playerId);
      distributePot(pot.mainPot, mainPotWinners);
    }

    // Distribute side pots
    for (const sidePot of pot.sidePots) {
      const eligibleWinners = winners
        .filter((w) => sidePot.eligiblePlayerIds.includes(w.playerId))
        .map((w) => w.playerId);
      distributePot(sidePot.amount, eligibleWinners);
    }

    return winnings;
  }
}

// Singleton instance
export const potCalculator = new PotCalculator();
