/**
 * Type declarations for pokersolver library
 */

declare module 'pokersolver' {
	export interface Hand {
		cards: string[];
		name: string;
		descr: string;
		rank: number;
	}

	export class Hand {
		static solve(cards: string[]): Hand;
		static winners(hands: Hand[]): Hand[];
	}
}
