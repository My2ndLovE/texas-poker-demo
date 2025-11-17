import type { ActionType, GameState, Player } from '@/types';

export interface BettingAction {
  type: ActionType;
  amount: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * BettingRules validates player actions according to Texas Hold'em rules
 */
export class BettingRules {
  /**
   * Get valid actions for a player
   */
  getValidActions(player: Player, gameState: GameState): ActionType[] {
    if (!this.canPlayerAct(player)) {
      return [];
    }

    const actions: ActionType[] = [];
    const currentBet = this.getCurrentBet(gameState);
    const playerBet = player.currentBet;

    // Fold is always valid
    actions.push('fold');

    // Check if player can check (no bet to call)
    if (currentBet === playerBet) {
      actions.push('check');
    }

    // Call if there's a bet to match and player has chips
    if (currentBet > playerBet && player.chips > 0) {
      const callAmount = currentBet - playerBet;
      if (player.chips >= callAmount) {
        actions.push('call');
      }
      // If player doesn't have enough to call, they can only go all-in
      if (player.chips < callAmount) {
        actions.push('all-in');
      }
    }

    // Bet/Raise if player has chips
    if (player.chips > 0) {
      if (currentBet === 0) {
        actions.push('bet');
      } else if (currentBet > 0 && player.chips > currentBet - playerBet) {
        actions.push('raise');
      }
    }

    // All-in is always available if player has chips
    if (player.chips > 0 && !actions.includes('all-in')) {
      actions.push('all-in');
    }

    return actions;
  }

  /**
   * Validate a player action
   */
  validateAction(player: Player, action: BettingAction, gameState: GameState): ValidationResult {
    if (!this.canPlayerAct(player)) {
      return {
        isValid: false,
        error: 'Player cannot act (folded, all-in, or eliminated)',
      };
    }

    const validActions = this.getValidActions(player, gameState);
    if (!validActions.includes(action.type)) {
      return {
        isValid: false,
        error: `Action ${action.type} is not valid for this player`,
      };
    }

    // Validate amount based on action type
    switch (action.type) {
      case 'fold':
      case 'check':
        return { isValid: true };

      case 'call':
        return this.validateCall(player, gameState);

      case 'bet':
        return this.validateBet(player, action.amount, gameState);

      case 'raise':
        return this.validateRaise(player, action.amount, gameState);

      case 'all-in':
        return this.validateAllIn(player, gameState);

      default:
        return {
          isValid: false,
          error: `Unknown action type: ${action.type}`,
        };
    }
  }

  /**
   * Validate a call action
   */
  private validateCall(player: Player, gameState: GameState): ValidationResult {
    const currentBet = this.getCurrentBet(gameState);
    const callAmount = currentBet - player.currentBet;

    if (callAmount === 0) {
      return {
        isValid: false,
        error: 'No bet to call (use check instead)',
      };
    }

    if (player.chips < callAmount) {
      return {
        isValid: false,
        error: 'Not enough chips to call (use all-in instead)',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a bet action
   */
  private validateBet(player: Player, amount: number, gameState: GameState): ValidationResult {
    const currentBet = this.getCurrentBet(gameState);

    if (currentBet > 0) {
      return {
        isValid: false,
        error: 'Cannot bet, there is already a bet (use raise instead)',
      };
    }

    const minBet = gameState.bigBlindAmount;

    if (amount < minBet && amount < player.chips) {
      return {
        isValid: false,
        error: `Bet must be at least ${minBet} (the big blind)`,
      };
    }

    if (amount > player.chips) {
      return {
        isValid: false,
        error: 'Bet amount exceeds available chips',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a raise action
   */
  private validateRaise(player: Player, amount: number, gameState: GameState): ValidationResult {
    const currentBet = this.getCurrentBet(gameState);

    if (currentBet === 0) {
      return {
        isValid: false,
        error: 'Cannot raise, no bet to raise (use bet instead)',
      };
    }

    const callAmount = currentBet - player.currentBet;
    const raiseAmount = amount - callAmount;

    // Minimum raise is typically the big blind or the size of the previous raise
    const minRaise = Math.max(gameState.minimumRaise, gameState.bigBlindAmount);

    // If raising all chips, it's valid even if below minimum
    if (amount === player.chips) {
      return { isValid: true };
    }

    if (raiseAmount < minRaise) {
      return {
        isValid: false,
        error: `Raise must be at least ${minRaise}`,
      };
    }

    if (amount > player.chips) {
      return {
        isValid: false,
        error: 'Raise amount exceeds available chips',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate an all-in action
   */
  private validateAllIn(player: Player, _gameState: GameState): ValidationResult {
    if (player.chips === 0) {
      return {
        isValid: false,
        error: 'Cannot go all-in with zero chips',
      };
    }

    return { isValid: true };
  }

  /**
   * Get the current highest bet in the round
   */
  getCurrentBet(gameState: GameState): number {
    return Math.max(...gameState.players.map((p) => p.currentBet), 0);
  }

  /**
   * Check if a player can act
   */
  private canPlayerAct(player: Player): boolean {
    return player.status === 'active' && player.chips >= 0;
  }

  /**
   * Calculate minimum raise amount
   */
  getMinimumRaise(gameState: GameState): number {
    const currentBet = this.getCurrentBet(gameState);
    if (currentBet === 0) {
      return gameState.bigBlindAmount;
    }
    return Math.max(gameState.minimumRaise, gameState.bigBlindAmount);
  }

  /**
   * Calculate call amount for a player
   */
  getCallAmount(player: Player, gameState: GameState): number {
    const currentBet = this.getCurrentBet(gameState);
    return Math.max(0, currentBet - player.currentBet);
  }

  /**
   * Check if betting round is complete
   * (all players have acted and bets are equal)
   */
  isBettingRoundComplete(gameState: GameState): boolean {
    const activePlayers = gameState.players.filter(
      (p) => p.status === 'active' || p.status === 'all-in',
    );

    if (activePlayers.length <= 1) {
      return true;
    }

    // Get all non-folded, non-all-in players
    const playersWhoCanAct = gameState.players.filter((p) => p.status === 'active');

    if (playersWhoCanAct.length === 0) {
      return true; // All players are all-in or folded
    }

    // Check if all active players have the same bet
    const currentBet = this.getCurrentBet(gameState);
    const allBetsEqual = playersWhoCanAct.every((p) => p.currentBet === currentBet);

    // Check if everyone has acted at least once
    // (In a real implementation, you'd track this with an action counter)
    return allBetsEqual;
  }
}

// Singleton instance
export const bettingRules = new BettingRules();
