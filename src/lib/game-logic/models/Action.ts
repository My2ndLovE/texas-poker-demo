/**
 * Action model for player actions in poker
 */

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface Action {
	type: ActionType;
	amount: number; // Amount to bet/raise (0 for fold/check)
	playerId: string;
	timestamp: number;
}

/**
 * Create a new action
 */
export function createAction(type: ActionType, playerId: string, amount: number = 0): Action {
	return {
		type,
		amount,
		playerId,
		timestamp: Date.now()
	};
}

/**
 * Get human-readable action description
 */
export function getActionDescription(action: Action, playerName: string): string {
	switch (action.type) {
		case 'fold':
			return `${playerName} folds`;
		case 'check':
			return `${playerName} checks`;
		case 'call':
			return `${playerName} calls ${action.amount}`;
		case 'bet':
			return `${playerName} bets ${action.amount}`;
		case 'raise':
			return `${playerName} raises to ${action.amount}`;
		case 'all-in':
			return `${playerName} goes all-in for ${action.amount}`;
		default:
			return `${playerName} acts`;
	}
}
