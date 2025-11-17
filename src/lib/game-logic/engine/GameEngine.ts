/**
 * Main game engine for Texas Hold'em
 * Orchestrates game flow and state transitions
 */

import type { GameState, BettingRound } from '../models/GameState';
import type { Player } from '../models/Player';
import type { Action, ActionType } from '../models/Action';
import { Deck } from '../deck/Deck';
import { getSmallBlindPosition, getBigBlindPosition, getUTGPosition, getFirstToActPostFlop, rotateDealer } from '../rules/PositionRules';
import { postSmallBlind, postBigBlind } from '../rules/BlindRules';
import { isBettingRoundComplete } from '../rules/BettingRules';
import { calculatePots } from '../pot/PotCalculator';
import { findWinners } from '../evaluation/HandEvaluator';

export class GameEngine {
	private deck: Deck;

	constructor() {
		this.deck = new Deck();
	}

	/**
	 * Start a new hand
	 */
	public startNewHand(state: GameState): GameState {
		// Reset deck
		this.deck.reset();

		// Reset players for new hand
		const players = state.players.map((p) => ({
			...p,
			cards: [],
			bet: 0,
			totalBet: 0,
			status: p.chips > 0 ? ('active' as const) : ('eliminated' as const),
			hasActed: false,
			isDealer: false,
			isSmallBlind: false,
			isBigBlind: false
		}));

		// Set dealer, blinds
		const dealerIndex = state.dealerIndex;
		const numPlayers = players.filter((p) => p.status !== 'eliminated').length;

		const sbPos = getSmallBlindPosition(dealerIndex, numPlayers);
		const bbPos = getBigBlindPosition(dealerIndex, numPlayers);

		players[dealerIndex].isDealer = true;
		players[sbPos].isSmallBlind = true;
		players[bbPos].isBigBlind = true;

		// Post blinds
		const sbAmount = postSmallBlind(players[sbPos], state.smallBlind);
		const bbAmount = postBigBlind(players[bbPos], state.bigBlind);

		// Deal hole cards (2 to each player)
		for (const player of players) {
			if (player.status === 'active' || player.status === 'all-in') {
				player.cards = this.deck.deal(2);
			}
		}

		// Set first to act (UTG preflop)
		const firstToAct = getUTGPosition(dealerIndex, numPlayers);

		return {
			...state,
			players,
			bettingRound: 'preflop',
			communityCards: [],
			burnedCards: [],
			currentPlayerIndex: firstToAct,
			currentBet: state.bigBlind,
			pot: {
				mainPot: sbAmount + bbAmount,
				sidePots: [],
				totalPot: sbAmount + bbAmount
			},
			actionHistory: [],
			lastActionTime: Date.now()
		};
	}

	/**
	 * Apply player action
	 */
	public applyAction(state: GameState, action: Action): GameState {
		const players = [...state.players];
		const player = players.find((p) => p.id === action.playerId);

		if (!player) return state;

		player.hasActed = true;

		switch (action.type) {
			case 'fold':
				player.status = 'folded';
				break;

			case 'check':
				// No chips change
				break;

			case 'call': {
				const callAmount = Math.min(state.currentBet - player.bet, player.chips);
				player.chips -= callAmount;
				player.bet += callAmount;
				player.totalBet += callAmount;
				if (player.chips === 0) player.status = 'all-in';
				break;
			}

			case 'bet':
			case 'raise': {
				player.chips -= action.amount;
				player.bet += action.amount;
				player.totalBet += action.amount;
				if (player.chips === 0) player.status = 'all-in';

				// Update current bet and reset hasActed for other players
				if (player.bet > state.currentBet) {
					players.forEach((p) => {
						if (p.id !== player.id && p.status === 'active') {
							p.hasActed = false;
						}
					});
				}
				break;
			}

			case 'all-in': {
				const allInAmount = player.chips;
				player.chips = 0;
				player.bet += allInAmount;
				player.totalBet += allInAmount;
				player.status = 'all-in';

				if (player.bet > state.currentBet) {
					players.forEach((p) => {
						if (p.id !== player.id && p.status === 'active') {
							p.hasActed = false;
						}
					});
				}
				break;
			}
		}

		// Update current bet
		const maxBet = Math.max(...players.map((p) => p.bet));
		const newState = {
			...state,
			players,
			currentBet: maxBet,
			actionHistory: [...state.actionHistory, action],
			lastActionTime: Date.now()
		};

		// Update pot
		const totalBets = players.reduce((sum, p) => sum + p.bet, 0);
		newState.pot = {
			...newState.pot,
			mainPot: totalBets,
			totalPot: totalBets
		};

		return newState;
	}

	/**
	 * Advance to next phase
	 */
	public advancePhase(state: GameState): GameState {
		const newState = { ...state };

		// Collect bets into pot
		const totalBets = newState.players.reduce((sum, p) => sum + p.bet, 0);
		newState.pot = calculatePots(newState.players);

		// Reset player bets for new round
		newState.players = newState.players.map((p) => ({
			...p,
			bet: 0,
			hasActed: false
		}));

		newState.currentBet = 0;

		switch (state.bettingRound) {
			case 'preflop':
				// Deal flop (burn 1, deal 3)
				this.deck.burn();
				newState.communityCards = this.deck.deal(3);
				newState.bettingRound = 'flop';
				newState.currentPlayerIndex = getFirstToActPostFlop(state.dealerIndex, newState.players);
				break;

			case 'flop':
				// Deal turn (burn 1, deal 1)
				this.deck.burn();
				newState.communityCards = [...newState.communityCards, ...this.deck.deal(1)];
				newState.bettingRound = 'turn';
				newState.currentPlayerIndex = getFirstToActPostFlop(state.dealerIndex, newState.players);
				break;

			case 'turn':
				// Deal river (burn 1, deal 1)
				this.deck.burn();
				newState.communityCards = [...newState.communityCards, ...this.deck.deal(1)];
				newState.bettingRound = 'river';
				newState.currentPlayerIndex = getFirstToActPostFlop(state.dealerIndex, newState.players);
				break;

			case 'river':
				// Go to showdown
				newState.bettingRound = 'showdown';
				break;

			case 'showdown':
				// Hand complete
				break;
		}

		return newState;
	}

	/**
	 * Complete hand and award pots
	 */
	public completeHand(state: GameState): GameState {
		// Find winners
		const activePlayers = state.players.filter(
			(p) => p.status !== 'folded' && p.status !== 'eliminated'
		);

		if (activePlayers.length === 0) {
			return state; // Should not happen
		}

		if (activePlayers.length === 1) {
			// Only one player left, they win
			const winner = activePlayers[0];
			winner.chips += state.pot.totalPot;
		} else {
			// Showdown: evaluate hands
			const playerHands = activePlayers.map((p) => ({
				playerId: p.id,
				cards: [...p.cards, ...state.communityCards]
			}));

			const winnerIds = findWinners(playerHands);

			// Distribute pot
			const share = Math.floor(state.pot.totalPot / winnerIds.length);
			const remainder = state.pot.totalPot % winnerIds.length;

			winnerIds.forEach((winnerId, index) => {
				const winner = state.players.find((p) => p.id === winnerId);
				if (winner) {
					winner.chips += share + (index === 0 ? remainder : 0);
				}
			});
		}

		// Rotate dealer
		const newDealerIndex = rotateDealer(state.dealerIndex, state.players);

		// Eliminate players with 0 chips
		const players = state.players.map((p) => ({
			...p,
			status: p.chips === 0 ? ('eliminated' as const) : p.status
		}));

		return {
			...state,
			players,
			dealerIndex: newDealerIndex,
			handNumber: state.handNumber + 1,
			pot: {
				mainPot: 0,
				sidePots: [],
				totalPot: 0
			}
		};
	}

	/**
	 * Check if hand is complete
	 */
	public isHandComplete(state: GameState): boolean {
		const activePlayers = state.players.filter(
			(p) => p.status !== 'folded' && p.status !== 'eliminated'
		);
		return activePlayers.length <= 1 || state.bettingRound === 'showdown';
	}

	/**
	 * Check if game is over (only 1 or 0 players with chips)
	 */
	public isGameOver(state: GameState): boolean {
		const playersWithChips = state.players.filter((p) => p.chips > 0);
		return playersWithChips.length <= 1;
	}
}
