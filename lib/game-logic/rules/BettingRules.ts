import { Player, canPlayerAct } from '../models/Player';
import { GameState } from '../models/GameState';

export interface ValidActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  canBet: boolean;
  canRaise: boolean;
  canAllIn: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
}

export class BettingRules {
  // Get valid actions for a player
  getValidActions(state: GameState, player: Player): ValidActions {
    if (!canPlayerAct(player)) {
      return {
        canFold: false,
        canCheck: false,
        canCall: false,
        canBet: false,
        canRaise: false,
        canAllIn: false,
        callAmount: 0,
        minRaise: 0,
        maxRaise: 0,
      };
    }

    const callAmount = state.currentBet - player.currentBet;
    const canCheck = callAmount === 0;
    const canCall = callAmount > 0 && callAmount < player.chips;
    const canBet = state.currentBet === 0 && player.chips > 0;
    const canRaise = state.currentBet > 0 && player.chips > callAmount;

    // Min raise is current bet + at least the size of the previous raise
    // (or big blind if no raises yet)
    const minRaise = state.currentBet + state.minRaise;
    const maxRaise = player.chips;

    return {
      canFold: true, // Can always fold
      canCheck,
      canCall,
      canBet,
      canRaise,
      canAllIn: player.chips > 0,
      callAmount,
      minRaise: Math.min(minRaise, maxRaise),
      maxRaise,
    };
  }

  // Validate a bet/raise amount
  validateBetAmount(
    amount: number,
    validActions: ValidActions,
    playerChips: number
  ): { valid: boolean; reason?: string } {
    if (amount < 0) {
      return { valid: false, reason: 'Amount cannot be negative' };
    }

    if (amount > playerChips) {
      return { valid: false, reason: 'Insufficient chips' };
    }

    // If going all-in, any amount is valid
    if (amount === playerChips) {
      return { valid: true };
    }

    // Otherwise, must meet minimum raise
    if (amount < validActions.minRaise) {
      return {
        valid: false,
        reason: `Minimum raise is ${validActions.minRaise}`,
      };
    }

    return { valid: true };
  }

  // Calculate new min raise after a raise
  calculateNewMinRaise(currentBet: number, newBet: number): number {
    return newBet - currentBet;
  }
}

// Singleton instance
export const bettingRules = new BettingRules();
