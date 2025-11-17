/**
 * Complete game state for Texas Hold'em
 */

import type { Card } from './Card';
import type { Player } from './Player';
import type { PotStructure } from './Pot';
import type { Action } from './Action';

export type GamePhase = 'menu' | 'playing' | 'game-over';
export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
	// Game phase
	phase: GamePhase;
	bettingRound: BettingRound;

	// Players
	players: Player[];
	currentPlayerIndex: number;
	dealerIndex: number;

	// Cards
	communityCards: Card[];
	burnedCards: Card[];

	// Pot and blinds
	pot: PotStructure;
	smallBlind: number;
	bigBlind: number;
	currentBet: number; // Highest bet in current round

	// Action history
	actionHistory: Action[];

	// Hand metadata
	handNumber: number;
	lastActionTime: number;
}

/**
 * Create initial game state
 */
export function createInitialGameState(
	players: Player[],
	smallBlind: number,
	bigBlind: number
): GameState {
	return {
		phase: 'playing',
		bettingRound: 'preflop',
		players,
		currentPlayerIndex: 0,
		dealerIndex: 0,
		communityCards: [],
		burnedCards: [],
		pot: {
			mainPot: 0,
			sidePots: [],
			totalPot: 0
		},
		smallBlind,
		bigBlind,
		currentBet: 0,
		actionHistory: [],
		handNumber: 1,
		lastActionTime: Date.now()
	};
}
