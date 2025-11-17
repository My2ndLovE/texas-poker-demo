/**
 * Bot orchestrator - manages bot decision-making
 * Routes to appropriate strategy based on difficulty
 */

import type { GameState } from '../models/GameState';
import type { Action } from '../models/Action';
import type { BotDifficulty } from '../models/Player';
import { EasyStrategy } from './strategies/EasyStrategy';
import { MediumStrategy } from './strategies/MediumStrategy';
import { HardStrategy } from './strategies/HardStrategy';

export class BotOrchestrator {
	private easyStrategy: EasyStrategy;
	private mediumStrategy: MediumStrategy;
	private hardStrategy: HardStrategy;

	constructor() {
		this.easyStrategy = new EasyStrategy();
		this.mediumStrategy = new MediumStrategy();
		this.hardStrategy = new HardStrategy();
	}

	/**
	 * Get bot action with realistic thinking delay
	 */
	public async getBotAction(state: GameState, botId: string): Promise<Action> {
		const bot = state.players.find((p) => p.id === botId);
		if (!bot || bot.type !== 'bot') {
			throw new Error('Invalid bot player');
		}

		// Simulate thinking time (500ms - 3000ms)
		const thinkingTime = 500 + Math.random() * 2500;
		await this.delay(thinkingTime);

		// Get action based on difficulty
		const difficulty = bot.botDifficulty || 'medium';
		return this.getActionForDifficulty(state, botId, difficulty);
	}

	/**
	 * Get action synchronously (for testing)
	 */
	public getBotActionSync(state: GameState, botId: string): Action {
		const bot = state.players.find((p) => p.id === botId);
		if (!bot || bot.type !== 'bot') {
			throw new Error('Invalid bot player');
		}

		const difficulty = bot.botDifficulty || 'medium';
		return this.getActionForDifficulty(state, botId, difficulty);
	}

	private getActionForDifficulty(
		state: GameState,
		botId: string,
		difficulty: BotDifficulty
	): Action {
		switch (difficulty) {
			case 'easy':
				return this.easyStrategy.getAction(state, botId);
			case 'medium':
				return this.mediumStrategy.getAction(state, botId);
			case 'hard':
				return this.hardStrategy.getAction(state, botId);
			default:
				return this.mediumStrategy.getAction(state, botId);
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
