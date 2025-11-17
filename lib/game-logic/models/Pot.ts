export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotStructure {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
}

export function createEmptyPot(): PotStructure {
  return {
    mainPot: 0,
    sidePots: [],
    totalPot: 0,
  };
}

export function getTotalPot(pot: PotStructure): number {
  return pot.mainPot + pot.sidePots.reduce((sum, sidePot) => sum + sidePot.amount, 0);
}

export function isPlayerEligibleForPot(playerId: string, pot: SidePot): boolean {
  return pot.eligiblePlayerIds.includes(playerId);
}
