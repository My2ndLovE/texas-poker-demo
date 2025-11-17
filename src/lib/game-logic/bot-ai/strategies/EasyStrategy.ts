/**
 * Easy bot strategy - simple random-based decisions
 * Win rate target: 35-40%
 * Characteristics: Plays loose, rarely bluffs, calls too much
 */

import type { GameState } from '../../models/GameState';
import type { Action } from '../../models/Action';
import { createAction } from '../../models/Action';
import { getValidActions, getCallAmount, getMinRaise } from '../../rules/BettingRules';

export class EasyStrategy {
	/**
	 * Get bot action
	 */
	public getAction(state: GameState, playerId: string): Action {
		const player = state.players.find((p) => p.id === playerId);
		if (!player) {
			return createAction('fold', playerId, 0);
		}

		const validActions = getValidActions(state, playerId);
		const callAmount = getCallAmount(state, playerId);

		// Simple hand strength estimate (very basic)
		const handStrength = this.estimateHandStrength(player.cards);

		// Easy bot: mostly calls, rarely raises, sometimes folds weak hands
		if (handStrength < 0.2) {
			// Very weak hand - fold 60% of time
			if (Math.random() < 0.6) {
				return createAction('fold', playerId, 0);
			}
		}

		// Check if can check
		if (validActions.includes('check')) {
			return createAction('check', playerId, 0);
		}

		// Call most of the time with any decent hand
		if (validActions.includes('call') && handStrength > 0.15) {
			const amount = Math.min(callAmount, player.chips);
			return createAction('call', playerId, amount);
		}

		// Rarely raise (only with strong hands)
		if (validActions.includes('raise') && handStrength > 0.7 && Math.random() < 0.3) {
			const minRaise = getMinRaise(state);
			const raiseAmount = Math.min(minRaise, player.chips);
			return createAction('raise', playerId, raiseAmount);
		}

		// Default to fold
		return createAction('fold', playerId, 0);
	}

	/**
	 * Very simple hand strength estimation (preflop only)
	 */
	private estimateHandStrength(cards: any[]): number {
		if (cards.length < 2) return 0;

		const ranks = cards.map((c) => c.rank);
		const suits = cards.map((c) => c.suit);

		// Pairs
		if (ranks[0] === ranks[1]) {
			const rankValue = this.getRankValue(ranks[0]);
			return 0.5 + rankValue / 26; // 0.5 to 1.0 for pairs
		}

		// High cards
		const highCard = Math.max(this.getRankValue(ranks[0]), this.getRankValue(ranks[1]));
		const lowCard = Math.min(this.getRankValue(ranks[0]), this.getRankValue(ranks[1]));

		// Suited
		const suited = suits[0] === suits[1] ? 0.1 : 0;

		return (highCard + lowCard) / 26 + suited;
	}

	private getRankValue(rank: string): number {
		const values: Record<string, number> = {
			'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
			T: 10, J: 11, Q: 12, K: 13, A: 14
		};
		return values[rank] || 0;
	}
}
