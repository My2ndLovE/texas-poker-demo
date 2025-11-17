/**
 * Pot model for main pot and side pots
 */

export interface SidePot {
	amount: number;
	eligiblePlayerIds: string[];
}

export interface PotStructure {
	mainPot: number;
	sidePots: SidePot[];
	totalPot: number;
}

/**
 * Create empty pot structure
 */
export function createEmptyPot(): PotStructure {
	return {
		mainPot: 0,
		sidePots: [],
		totalPot: 0
	};
}

/**
 * Add amount to pot
 */
export function addToPot(pot: PotStructure, amount: number): PotStructure {
	return {
		...pot,
		mainPot: pot.mainPot + amount,
		totalPot: pot.totalPot + amount
	};
}
