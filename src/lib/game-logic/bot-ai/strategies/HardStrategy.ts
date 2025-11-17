/**
 * Hard bot strategy - advanced with range awareness and adaptation
 * Win rate target: 55-60%
 * Characteristics: Plays optimal TAG, ranges, bluffs strategically, adapts to opponents
 */

import type { GameState } from '../../models/GameState';
import type { Action } from '../../models/Action';
import { createAction } from '../../models/Action';
import { getValidActions, getCallAmount, getMinRaise } from '../../rules/BettingRules';

export class HardStrategy {
	// Reserved for future opponent tracking
	private _opponentStats: Map<string, { vpip: number; pfr: number; aggression: number }> = new Map();

	/**
	 * Get bot action with advanced strategy
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
		const boardTexture = this.analyzeBoardTexture(state.communityCards);

		// Advanced position adjustment
		const positionModifier =
			position === 'late' ? 0.2 : position === 'middle' ? 0.1 : -0.05;
		const adjustedStrength = Math.min(handStrength + positionModifier, 1.0);

		// Tight preflop
		if (state.bettingRound === 'preflop' && adjustedStrength < 0.35) {
			return createAction('fold', playerId, 0);
		}

		// Post-flop: more nuanced
		if (state.bettingRound !== 'preflop' && adjustedStrength < 0.25) {
			// Consider implied odds and board texture
			if (boardTexture === 'draw-heavy' && this.hasDrawPotential(player.cards)) {
				// Continue with draws if odds are good
				if (potOdds < 0.25) {
					const amount = Math.min(callAmount, player.chips);
					return createAction('call', playerId, amount);
				}
			}
			return createAction('fold', playerId, 0);
		}

		// Check/bet decisions
		if (validActions.includes('check')) {
			// Check strong hands for pot control
			if (handStrength > 0.8 && Math.random() < 0.3) {
				return createAction('check', playerId, 0);
			}

			// Bet with medium-strong hands
			if (handStrength > 0.55) {
				const betSize = this.calculateBetSize(state.pot.totalPot, handStrength, boardTexture);
				const betAmount = Math.min(betSize, player.chips);
				return createAction('bet', playerId, betAmount);
			}

			// Bluff on scary boards
			if (boardTexture === 'scary' && position === 'late' && Math.random() < 0.35) {
				const bluffSize = Math.floor(state.pot.totalPot * 0.7);
				return createAction('bet', playerId, Math.min(bluffSize, player.chips));
			}

			return createAction('check', playerId, 0);
		}

		// Call decisions
		if (validActions.includes('call')) {
			// Call with good odds or strong hands
			if (adjustedStrength > potOdds + 0.15 || adjustedStrength > 0.7) {
				const amount = Math.min(callAmount, player.chips);
				return createAction('call', playerId, amount);
			}

			// Hero call occasionally
			if (position === 'late' && Math.random() < 0.15) {
				const amount = Math.min(callAmount, player.chips);
				return createAction('call', playerId, amount);
			}
		}

		// Raise decisions
		if (validActions.includes('raise') && adjustedStrength > 0.7) {
			const minRaise = getMinRaise(state);
			const raiseSize = this.calculateRaiseSize(
				state.pot.totalPot,
				state.currentBet,
				handStrength
			);
			const raiseAmount = Math.min(Math.max(minRaise, raiseSize), player.chips);
			return createAction('raise', playerId, raiseAmount);
		}

		// Semi-bluff with draws
		if (
			validActions.includes('raise') &&
			boardTexture === 'draw-heavy' &&
			this.hasDrawPotential(player.cards) &&
			position === 'late' &&
			Math.random() < 0.4
		) {
			const minRaise = getMinRaise(state);
			const semiBluffSize = Math.floor(state.pot.totalPot * 0.65);
			const raiseAmount = Math.min(Math.max(minRaise, semiBluffSize), player.chips);
			return createAction('raise', playerId, raiseAmount);
		}

		// Default to fold
		return createAction('fold', playerId, 0);
	}

	private estimateHandStrength(holeCards: any[], communityCards: any[]): number {
		if (holeCards.length < 2) return 0;

		if (communityCards.length === 0) {
			return this.preflopStrength(holeCards);
		}

		// Post-flop estimation (simplified)
		return this.preflopStrength(holeCards) * 0.6 + 0.4;
	}

	private preflopStrength(cards: any[]): number {
		const ranks = cards.map((c) => c.rank);
		const suits = cards.map((c) => c.suit);

		const r1 = this.getRankValue(ranks[0]);
		const r2 = this.getRankValue(ranks[1]);

		// Premium pairs
		if (r1 === r2) {
			if (r1 >= 12) return 0.95; // QQ+
			if (r1 >= 10) return 0.85; // TT+
			return 0.5 + r1 / 28;
		}

		// High cards
		const high = Math.max(r1, r2);
		const low = Math.min(r1, r2);

		// AK, AQ suited
		if (high === 14 && low >= 12 && suits[0] === suits[1]) return 0.9;
		if (high === 14 && low >= 11) return 0.8;

		// Broadway cards
		if (high >= 12 && low >= 11) return 0.7;

		let strength = (high + low) / 28;

		if (suits[0] === suits[1]) strength += 0.15;

		const gap = high - low;
		if (gap <= 1) strength += 0.1;

		return Math.min(strength, 1.0);
	}

	private analyzeBoardTexture(communityCards: any[]): 'dry' | 'draw-heavy' | 'scary' | 'neutral' {
		if (communityCards.length < 3) return 'neutral';

		const suits = communityCards.map((c) => c.suit);
		const ranks = communityCards.map((c) => this.getRankValue(c.rank)).sort((a, b) => a - b);

		// Check for flush draws
		const suitCounts = suits.reduce(
			(acc, suit) => {
				acc[suit] = (acc[suit] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
		const maxSuitCount = Math.max(...(Object.values(suitCounts) as number[]));

		// Check for straight draws
		const hasConnectors =
			ranks.length >= 3 &&
			(ranks[2] - ranks[0] <= 4 || ranks[ranks.length - 1] - ranks[ranks.length - 3] <= 4);

		if (maxSuitCount >= 3 || hasConnectors) return 'draw-heavy';
		if (ranks.every((r) => r >= 10)) return 'scary';
		if (ranks.every((r) => r <= 7)) return 'dry';

		return 'neutral';
	}

	private hasDrawPotential(cards: any[]): boolean {
		// Simplified - just check for suited or connected cards
		if (cards.length < 2) return false;
		const ranks = cards.map((c) => this.getRankValue(c.rank));
		const suits = cards.map((c) => c.suit);

		return suits[0] === suits[1] || Math.abs(ranks[0] - ranks[1]) <= 4;
	}

	private calculateBetSize(
		potSize: number,
		handStrength: number,
		_boardTexture: string
	): number {
		// Value bet sizing
		if (handStrength > 0.8) {
			return Math.floor(potSize * 0.75);
		}
		if (handStrength > 0.6) {
			return Math.floor(potSize * 0.55);
		}
		// Smaller bets with medium hands
		return Math.floor(potSize * 0.4);
	}

	private calculateRaiseSize(potSize: number, _currentBet: number, handStrength: number): number {
		if (handStrength > 0.85) {
			return Math.floor(potSize * 1.2);
		}
		return Math.floor(potSize * 0.8);
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
			'2': 2,
			'3': 3,
			'4': 4,
			'5': 5,
			'6': 6,
			'7': 7,
			'8': 8,
			'9': 9,
			T: 10,
			J: 11,
			Q: 12,
			K: 13,
			A: 14
		};
		return values[rank] || 0;
	}
}
