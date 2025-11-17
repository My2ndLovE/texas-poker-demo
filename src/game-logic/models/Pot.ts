export interface Pot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotStructure {
  mainPot: Pot;
  sidePots: Pot[];
  totalPot: number;
}
