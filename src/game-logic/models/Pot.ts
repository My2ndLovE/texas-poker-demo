export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotStructure {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
}

export const createEmptyPot = (): PotStructure => ({
  mainPot: 0,
  sidePots: [],
  totalPot: 0,
});
