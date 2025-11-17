/**
 * Medium bot strategy - position-aware with basic pot odds
 * Win rate target: 45-50%
 * Characteristics: Plays tight-aggressive, considers position, basic pot odds
 */

import type { GameState } from '../../models/GameState';
import type { Action } from '../../models/Action';
import { createAction } from '../../models/Action';
import { getValidActions, getCallAmount, getMinRaise } from '../../rules/BettingRules';

export class MediumStrategy {
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

		const handStrength = this.estimateHandStrength(player.cards, state.communityCards);
		const position = this.getPosition(player.position, state.dealerIndex, state.players.length);
		const potOdds = this.calculatePotOdds(state.pot.totalPot, callAmount);

		// Position-based tightness
		const positionModifier = position === 'late' ? 0.15 : position === 'middle' ? 0.05 : 0;
		const adjustedStrength = handStrength + positionModifier;

		// Fold weak hands
		if (adjustedStrength < 0.3) {
			return createAction('fold', playerId, 0);
		}

		// Check if free
		if (validActions.includes('check')) {
			// Sometimes bet with strong hands
			if (handStrength > 0.7 && Math.random() < 0.5) {
				const betAmount = Math.min(Math.floor(state.pot.totalPot * 0.5), player.chips);
				return createAction('bet', playerId, betAmount);
			}
			return createAction('check', playerId, 0);
		}

		// Call with pot odds
		if (validActions.includes('call')) {
			if (handStrength > potOdds || handStrength > 0.6) {
				const amount = Math.min(callAmount, player.chips);
				return createAction('call', playerId, amount);
			}
		}

		// Raise with strong hands
		if (validActions.includes('raise') && handStrength > 0.75) {
			const minRaise = getMinRaise(state);
			const raiseSize = Math.floor(state.pot.totalPot * 0.75);
			const raiseAmount = Math.min(Math.max(minRaise, raiseSize), player.chips);
			return createAction('raise', playerId, raiseAmount);
		}

		// Bluff occasionally in position
		if (position === 'late' && Math.random() < 0.2 && validActions.includes('bet')) {
			const bluffSize = Math.min(Math.floor(state.pot.totalPot * 0.6), player.chips);
			return createAction('bet', playerId, bluffSize);
		}

		// Default to fold
		return createAction('fold', playerId, 0);
	}

	private estimateHandStrength(holeCards: any[], communityCards: any[]): number {
		if (holeCards.length < 2) return 0;

		// Simple preflop strength
		if (communityCards.length === 0) {
			return this.preflopStrength(holeCards);
		}

		// Post-flop: very basic estimation
		// In production, would use actual hand evaluation
		return this.preflopStrength(holeCards) * 0.7 + 0.3;
	}

	private preflopStrength(cards: any[]): number {
		const ranks = cards.map((c) => c.rank);
		const suits = cards.map((c) => c.suit);

		const r1 = this.getRankValue(ranks[0]);
		const r2 = this.getRankValue(ranks[1]);

		// Pocket pairs
		if (r1 === r2) {
			return 0.5 + r1 / 28;
		}

		// High cards
		const high = Math.max(r1, r2);
		const low = Math.min(r1, r2);
		const gap = high - low;

		let strength = (high + low) / 28;

		// Suited bonus
		if (suits[0] === suits[1]) {
			strength += 0.15;
		}

		// Connected cards bonus
		if (gap <= 2) {
			strength += 0.1;
		}

		return Math.min(strength, 1.0);
	}

	private getPosition(
		playerPos: number,
		dealerPos: number,
		numPlayers: number
	): 'early' | 'middle' | 'late' {
		let distance = playerPos - dealerPos;
		if (distance < 0) distance += numPlayers;

		if (distance <= 2) return 'late';
		if (distance <= 5) return 'middle';
		return 'early';
	}

	private calculatePotOdds(potSize: number, callAmount: number): number {
		if (callAmount === 0) return 0;
		return callAmount / (potSize + callAmount);
	}

	private getRankValue(rank: string): number {
		const values: Record<string, number> = {
			'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
			T: 10, J: 11, Q: 12, K: 13, A: 14
		};
		return values[rank] || 0;
	}
}
