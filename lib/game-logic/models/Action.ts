export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface Action {
  type: ActionType;
  amount: number; // Amount for bet/raise/call
  playerId: string;
  timestamp: number;
}

export function createAction(type: ActionType, playerId: string, amount: number = 0): Action {
  return {
    type,
    amount,
    playerId,
    timestamp: Date.now(),
  };
}

export function actionToString(action: Action, playerName: string): string {
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
      return `${playerName} is all-in for ${action.amount}`;
    default:
      return `${playerName} ${action.type}`;
  }
}
