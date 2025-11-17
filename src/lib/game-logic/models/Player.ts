/**
 * Player model for Texas Hold'em
 * Represents a player in the game (human or bot)
 */

import type { Card } from './Card';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'eliminated';
export type PlayerType = 'human' | 'bot';
export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
	id: string;
	name: string;
	type: PlayerType;
	botDifficulty?: BotDifficulty;
	chips: number;
	cards: Card[];
	bet: number; // Current bet in this round
	totalBet: number; // Total bet in this hand (for side pots)
	status: PlayerStatus;
	position: number; // Seat number (0-8)
	hasActed: boolean; // Whether player has acted in current betting round
	isDealer: boolean;
	isSmallBlind: boolean;
	isBigBlind: boolean;
}

/**
 * Create a new player
 */
export function createPlayer(
	id: string,
	name: string,
	chips: number,
	position: number,
	type: PlayerType = 'bot',
	botDifficulty?: BotDifficulty
): Player {
	return {
		id,
		name,
		type,
		botDifficulty,
		chips,
		cards: [],
		bet: 0,
		totalBet: 0,
		status: 'active',
		position,
		hasActed: false,
		isDealer: false,
		isSmallBlind: false,
		isBigBlind: false
	};
}

/**
 * Check if player can act (not folded, not all-in, not eliminated)
 */
export function canPlayerAct(player: Player): boolean {
	return player.status === 'active' && player.chips > 0;
}

/**
 * Check if player is active in current hand
 */
export function isPlayerActiveInHand(player: Player): boolean {
	return player.status !== 'folded' && player.status !== 'eliminated';
}

/**
 * Reset player for new hand
 */
export function resetPlayerForNewHand(player: Player): Player {
	return {
		...player,
		cards: [],
		bet: 0,
		totalBet: 0,
		status: player.chips > 0 ? 'active' : 'eliminated',
		hasActed: false,
		isDealer: false,
		isSmallBlind: false,
		isBigBlind: false
	};
}
