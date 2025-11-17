/**
 * Game store - manages game state with Svelte stores
 * Central reactive state for the poker game
 */

import { writable, derived } from 'svelte/store';
import type { GameState } from '$game/models/GameState';
import type { Player } from '$game/models/Player';
import type { Action } from '$game/models/Action';
import { createInitialGameState } from '$game/models/GameState';
import { createPlayer } from '$game/models/Player';
import { GameEngine } from '$game/engine/GameEngine';
import { BotOrchestrator } from '$game/bot-ai/BotOrchestrator';
import { isBettingRoundComplete } from '$game/rules/BettingRules';
import { getNextActivePlayer } from '$game/rules/PositionRules';

// Create engine and bot orchestrator
const gameEngine = new GameEngine();
const botOrchestrator = new BotOrchestrator();

// Initial state
const initialState: GameState | null = null;

// Create writable store
export const gameStore = writable<GameState | null>(initialState);

/**
 * Start a new game
 */
export function startNewGame(settings: {
	numBots: number;
	botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
	startingChips: number;
	smallBlind: number;
	bigBlind: number;
}): void {
	// Create players
	const players: Player[] = [];

	// Human player
	players.push(createPlayer('human-1', 'You', settings.startingChips, 0, 'human'));

	// Bot players
	for (let i = 0; i < settings.numBots; i++) {
		const botNames = [
			'Alice',
			'Bob',
			'Charlie',
			'Diana',
			'Eve',
			'Frank',
			'Grace',
			'Henry',
			'Ivy'
		];
		const name = botNames[i] || `Bot ${i + 1}`;

		let difficulty: 'easy' | 'medium' | 'hard';
		if (settings.botDifficulty === 'mixed') {
			const rand = Math.random();
			difficulty = rand < 0.33 ? 'easy' : rand < 0.66 ? 'medium' : 'hard';
		} else {
			difficulty = settings.botDifficulty;
		}

		players.push(
			createPlayer(
				`bot-${i + 1}`,
				name,
				settings.startingChips,
				i + 1,
				'bot',
				difficulty
			)
		);
	}

	// Create initial game state
	const state = createInitialGameState(players, settings.smallBlind, settings.bigBlind);

	// Start first hand
	const newState = gameEngine.startNewHand(state);

	gameStore.set(newState);

	// If first player is bot, trigger bot action
	checkAndPlayBotTurn(newState);
}

/**
 * Apply player action
 */
export function applyPlayerAction(action: Action): void {
	gameStore.update((state) => {
		if (!state) return state;

		let newState = gameEngine.applyAction(state, action);

		// Move to next player
		newState = advanceToNextPlayer(newState);

		return newState;
	});

	// Check if bot should play
	gameStore.subscribe((state) => {
		if (state) {
			checkAndPlayBotTurn(state);
		}
	})();
}

/**
 * Advance to next player
 */
function advanceToNextPlayer(state: GameState): GameState {
	// Check if betting round complete
	if (isBettingRoundComplete(state)) {
		// Check if hand is complete
		if (gameEngine.isHandComplete(state)) {
			// Complete hand and start new one
			let completedState = gameEngine.completeHand(state);

			// Check if game is over
			if (gameEngine.isGameOver(completedState)) {
				completedState.phase = 'game-over';
				return completedState;
			}

			// Start new hand
			return gameEngine.startNewHand(completedState);
		}

		// Advance to next phase
		return gameEngine.advancePhase(state);
	}

	// Move to next active player
	const nextPlayerIndex = getNextActivePlayer(state.currentPlayerIndex, state.players);

	return {
		...state,
		currentPlayerIndex: nextPlayerIndex
	};
}

/**
 * Check if current player is bot and play their turn
 */
async function checkAndPlayBotTurn(state: GameState): Promise<void> {
	const currentPlayer = state.players[state.currentPlayerIndex];

	if (currentPlayer && currentPlayer.type === 'bot' && currentPlayer.status === 'active') {
		// Bot's turn - get action after delay
		const botAction = await botOrchestrator.getBotAction(state, currentPlayer.id);

		// Apply bot action
		applyPlayerAction(botAction);
	}
}

/**
 * Derived stores for easy access
 */
export const currentPlayer = derived(gameStore, ($game) => {
	if (!$game) return null;
	return $game.players[$game.currentPlayerIndex] || null;
});

export const humanPlayer = derived(gameStore, ($game) => {
	if (!$game) return null;
	return $game.players.find((p) => p.type === 'human') || null;
});

export const isHumanTurn = derived([currentPlayer, humanPlayer], ([$current, $human]) => {
	return $current && $human && $current.id === $human.id;
});
