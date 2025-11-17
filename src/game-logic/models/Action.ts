import { ActionType } from '@/utils/constants';

export interface Action {
  type: ActionType;
  playerId: string;
  amount: number;
  timestamp: number;
}

export const createAction = (
  type: ActionType,
  playerId: string,
  amount: number = 0
): Action => ({
  type,
  playerId,
  amount,
  timestamp: Date.now(),
});
