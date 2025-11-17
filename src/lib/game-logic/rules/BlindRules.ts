/**
 * Blind posting rules for Texas Hold'em
 * Handles small blind and big blind posting
 */

import type { Player } from '../models/Player';

/**
 * Post small blind
 * Returns the actual amount posted (may be less than requested if all-in)
 */
export function postSmallBlind(player: Player, blindAmount: number): number {
	const actualAmount = Math.min(blindAmount, player.chips);

	player.chips -= actualAmount;
	player.bet = actualAmount;
	player.totalBet = actualAmount;
	player.hasActed = true;

	if (player.chips === 0) {
		player.status = 'all-in';
	}

	return actualAmount;
}

/**
 * Post big blind
 * Returns the actual amount posted (may be less than requested if all-in)
 */
export function postBigBlind(player: Player, blindAmount: number): number {
	const actualAmount = Math.min(blindAmount, player.chips);

	player.chips -= actualAmount;
	player.bet = actualAmount;
	player.totalBet = actualAmount;
	player.hasActed = true;

	if (player.chips === 0) {
		player.status = 'all-in';
	}

	return actualAmount;
}
