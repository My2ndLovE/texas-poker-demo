import { Player } from '../models/Player';
import { ActionType } from '@/utils/constants';

export class BettingRules {
  canCheck(player: Player, currentBet: number): boolean {
    return player.currentBet >= currentBet;
  }

  canCall(player: Player, currentBet: number): boolean {
    return currentBet > player.currentBet && player.chips > 0;
  }

  canRaise(player: Player, currentBet: number, minRaise: number): boolean {
    const minRaiseAmount = this.getMinRaiseAmount(player, currentBet, minRaise);
    return player.chips >= minRaiseAmount;
  }

  canBet(player: Player, minBet: number): boolean {
    return player.chips >= minBet;
  }

  getCallAmount(player: Player, currentBet: number): number {
    const needed = currentBet - player.currentBet;
    return Math.min(needed, player.chips);
  }

  getMinRaiseAmount(player: Player, currentBet: number, minRaise: number): number {
    const totalRaise = currentBet + minRaise;
    return totalRaise - player.currentBet;
  }

  getMaxRaiseAmount(player: Player): number {
    return player.chips;
  }

  isValidRaise(
    player: Player,
    currentBet: number,
    minRaise: number,
    raiseAmount: number
  ): boolean {
    // Cannot raise more than player has
    if (raiseAmount > player.chips) {
      return false;
    }

    // If going all-in, any amount is valid
    if (this.willBeAllIn(player, raiseAmount)) {
      return true;
    }

    // Must meet minimum raise
    const minRequired = this.getMinRaiseAmount(player, currentBet, minRaise);
    return raiseAmount >= minRequired;
  }

  isValidBet(player: Player, minBet: number, betAmount: number): boolean {
    // Cannot bet more than player has
    if (betAmount > player.chips) {
      return false;
    }

    // If going all-in, any amount is valid
    if (betAmount === player.chips) {
      return true;
    }

    // Must meet minimum bet
    return betAmount >= minBet;
  }

  willBeAllIn(player: Player, betAmount: number): boolean {
    return betAmount >= player.chips;
  }

  getAvailableActions(player: Player, currentBet: number, minRaise: number): ActionType[] {
    const actions: ActionType[] = [ActionType.Fold];

    if (this.canCheck(player, currentBet)) {
      actions.push(ActionType.Check);
      if (player.chips > 0) {
        actions.push(ActionType.Bet);
      }
    } else {
      // There's a bet to call
      if (this.canCall(player, currentBet)) {
        actions.push(ActionType.Call);
      }

      if (this.canRaise(player, currentBet, minRaise)) {
        actions.push(ActionType.Raise);
      } else if (player.chips > 0) {
        // Can't raise but can go all-in
        actions.push(ActionType.AllIn);
      }
    }

    return actions;
  }

  calculateNewBet(
    player: Player,
    action: ActionType,
    amount: number,
    currentBet: number
  ): { newBet: number; chipsUsed: number; isAllIn: boolean } {
    let newBet = player.currentBet;
    let chipsUsed = 0;

    switch (action) {
      case ActionType.Check:
      case ActionType.Fold:
        // No chips used
        break;

      case ActionType.Call:
        chipsUsed = this.getCallAmount(player, currentBet);
        newBet = Math.min(player.currentBet + chipsUsed, currentBet);
        break;

      case ActionType.Bet:
      case ActionType.Raise:
        chipsUsed = Math.min(amount, player.chips);
        newBet = player.currentBet + chipsUsed;
        break;

      case ActionType.AllIn:
        chipsUsed = player.chips;
        newBet = player.currentBet + chipsUsed;
        break;
    }

    const isAllIn = chipsUsed === player.chips && chipsUsed > 0;

    return { newBet, chipsUsed, isAllIn };
  }
}
