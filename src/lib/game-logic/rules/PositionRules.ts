/**
 * Position rules for Texas Hold'em
 * Handles dealer button, blinds, and action order
 */

import type { Player } from '../models/Player';

/**
 * Get small blind position
 */
export function getSmallBlindPosition(dealerIndex: number, numPlayers: number): number {
	if (numPlayers === 2) {
		// Heads-up: dealer is small blind
		return dealerIndex;
	}
	return (dealerIndex + 1) % numPlayers;
}

/**
 * Get big blind position
 */
export function getBigBlindPosition(dealerIndex: number, numPlayers: number): number {
	if (numPlayers === 2) {
		// Heads-up: non-dealer is big blind
		return (dealerIndex + 1) % numPlayers;
	}
	return (dealerIndex + 2) % numPlayers;
}

/**
 * Get UTG (Under The Gun) position - first to act preflop
 */
export function getUTGPosition(dealerIndex: number, numPlayers: number): number {
	if (numPlayers === 2) {
		// Heads-up: dealer acts first preflop
		return dealerIndex;
	}
	return (dealerIndex + 3) % numPlayers;
}

/**
 * Get first to act post-flop (first active player left of dealer)
 */
export function getFirstToActPostFlop(dealerIndex: number, players: Player[]): number {
	const numPlayers = players.length;

	for (let i = 1; i <= numPlayers; i++) {
		const position = (dealerIndex + i) % numPlayers;
		const player = players[position];
		if (player && player.status === 'active') {
			return position;
		}
	}

	return dealerIndex; // Fallback
}

/**
 * Get next active player clockwise
 */
export function getNextActivePlayer(currentIndex: number, players: Player[]): number {
	const numPlayers = players.length;
	let nextIndex = (currentIndex + 1) % numPlayers;
	let checked = 0;

	while (checked < numPlayers) {
		const player = players[nextIndex];
		if (player && player.status === 'active') {
			return nextIndex;
		}
		nextIndex = (nextIndex + 1) % numPlayers;
		checked++;
	}

	return currentIndex; // No active players found
}

/**
 * Rotate dealer button to next active player
 */
export function rotateDealer(currentDealerIndex: number, players: Player[]): number {
	return getNextActivePlayer(currentDealerIndex, players);
}
