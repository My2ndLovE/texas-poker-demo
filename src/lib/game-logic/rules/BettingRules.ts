/**
 * Betting rules and validation for Texas Hold'em
 * Handles all betting logic including min/max bets, raises, and all-ins
 */

import type { GameState } from '../models/GameState';
import type { ActionType } from '../models/Action';

/**
 * Get valid actions for a player
 */
export function getValidActions(state: GameState, playerId: string): ActionType[] {
	const player = state.players.find((p) => p.id === playerId);
	if (!player || player.status !== 'active') {
		return [];
	}

	const actions: ActionType[] = ['fold'];

	// Can always fold
	const currentBet = state.currentBet;
	const playerBet = player.bet;

	// Check if player can check
	if (currentBet === playerBet) {
		actions.push('check');
	}

	// Can call if there's a bet to match and player has chips
	if (currentBet > playerBet && player.chips > 0) {
		const callAmount = currentBet - playerBet;
		if (callAmount <= player.chips) {
			actions.push('call');
		}
	}

	// Can bet/raise if player has chips
	if (player.chips > 0) {
		if (currentBet === 0) {
			actions.push('bet');
		} else {
			actions.push('raise');
		}
	}

	// Can always go all-in
	if (player.chips > 0) {
		actions.push('all-in');
	}

	return actions;
}

/**
 * Calculate minimum raise amount
 */
export function getMinRaise(state: GameState): number {
	const currentBet = state.currentBet;
	const bigBlind = state.bigBlind;

	if (currentBet === 0) {
		// First bet must be at least big blind
		return bigBlind;
	}

	// Min raise is double the current bet (or double the last raise)
	return currentBet * 2;
}

/**
 * Calculate call amount for a player
 */
export function getCallAmount(state: GameState, playerId: string): number {
	const player = state.players.find((p) => p.id === playerId);
	if (!player) return 0;

	return Math.max(0, state.currentBet - player.bet);
}

/**
 * Validate bet/raise amount
 */
export function validateBetAmount(
	state: GameState,
	playerId: string,
	amount: number
): { valid: boolean; error?: string } {
	const player = state.players.find((p) => p.id === playerId);
	if (!player) {
		return { valid: false, error: 'Player not found' };
	}

	if (amount < 0) {
		return { valid: false, error: 'Bet amount cannot be negative' };
	}

	if (amount > player.chips) {
		return { valid: false, error: 'Insufficient chips' };
	}

	const minRaise = getMinRaise(state);
	if (amount < minRaise && amount < player.chips) {
		return { valid: false, error: `Minimum raise is ${minRaise}` };
	}

	return { valid: true };
}

/**
 * Check if betting round is complete
 */
export function isBettingRoundComplete(state: GameState): boolean {
	const activePlayers = state.players.filter((p) => p.status === 'active' || p.status === 'all-in');

	// If only one player left, round is complete
	const playingPlayers = state.players.filter((p) => p.status === 'active');
	if (playingPlayers.length <= 1) {
		return true;
	}

	// All active players must have acted and have equal bets
	const currentBet = state.currentBet;
	for (const player of activePlayers) {
		if (player.status === 'active' && !player.hasActed) {
			return false;
		}
		if (player.status === 'active' && player.bet !== currentBet) {
			return false;
		}
	}

	return true;
}
