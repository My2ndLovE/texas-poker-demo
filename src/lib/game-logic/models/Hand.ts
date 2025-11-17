/**
 * Hand evaluation result model
 */

import type { Card } from './Card';

export type HandRank =
	| 'high-card'
	| 'pair'
	| 'two-pair'
	| 'three-of-a-kind'
	| 'straight'
	| 'flush'
	| 'full-house'
	| 'four-of-a-kind'
	| 'straight-flush'
	| 'royal-flush';

export interface HandResult {
	rank: HandRank;
	value: number; // Numeric value for comparison (higher = better)
	description: string; // Human-readable description
	cards: Card[]; // The 5 cards that make up the hand
}

/**
 * Get hand rank name
 */
export function getHandRankName(rank: HandRank): string {
	const names: Record<HandRank, string> = {
		'high-card': 'High Card',
		pair: 'Pair',
		'two-pair': 'Two Pair',
		'three-of-a-kind': 'Three of a Kind',
		straight: 'Straight',
		flush: 'Flush',
		'full-house': 'Full House',
		'four-of-a-kind': 'Four of a Kind',
		'straight-flush': 'Straight Flush',
		'royal-flush': 'Royal Flush'
	};
	return names[rank];
}
