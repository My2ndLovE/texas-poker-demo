import { Player } from '@/game-logic/models/Player';
import { GameState } from '@/game-logic/models/GameState';
import { ActionType, GamePhase } from '@/utils/constants';
import { BettingRules } from '@/game-logic/rules/BettingRules';
import { HandStrengthAnalyzer, HandStrengthLevel } from '../analysis/HandStrength';

export interface BotDecision {
  action: ActionType;
  amount: number;
}

export class EasyBotStrategy {
  private bettingRules: BettingRules;
  private handAnalyzer: HandStrengthAnalyzer;

  constructor() {
    this.bettingRules = new BettingRules();
    this.handAnalyzer = new HandStrengthAnalyzer();
  }

  decide(bot: Player, gameState: GameState): BotDecision {
    const availableActions = this.bettingRules.getAvailableActions(
      bot,
      gameState.currentBet,
      gameState.minRaise
    );

    // Analyze hand strength
    const strength = this.getHandStrength(bot, gameState);

    // Very simple strategy with lots of randomness
    const random = Math.random();

    // Very weak hands
    if (strength === HandStrengthLevel.VeryWeak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        return { action: ActionType.Check, amount: 0 };
      }
      // 80% fold, 20% call
      if (random < 0.8 || !availableActions.includes(ActionType.Call)) {
        return { action: ActionType.Fold, amount: 0 };
      }
      return {
        action: ActionType.Call,
        amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
      };
    }

    // Weak hands
    if (strength === HandStrengthLevel.Weak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // 70% check, 30% bet
        if (random < 0.7 || !availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Check, amount: 0 };
        }
        return { action: ActionType.Bet, amount: gameState.minRaise };
      }
      // 50% fold, 50% call
      if (random < 0.5 || !availableActions.includes(ActionType.Call)) {
        return { action: ActionType.Fold, amount: 0 };
      }
      return {
        action: ActionType.Call,
        amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
      };
    }

    // Medium hands
    if (strength === HandStrengthLevel.Medium) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // 40% check, 60% bet
        if (random < 0.4) {
          return { action: ActionType.Check, amount: 0 };
        }
        if (availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Bet, amount: gameState.minRaise };
        }
        return { action: ActionType.Check, amount: 0 };
      }
      // 80% call, 20% raise
      if (random < 0.8 || !availableActions.includes(ActionType.Raise)) {
        if (availableActions.includes(ActionType.Call)) {
          return {
            action: ActionType.Call,
            amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
          };
        }
      }
      const minRaise = this.bettingRules.getMinRaiseAmount(
        bot,
        gameState.currentBet,
        gameState.minRaise
      );
      return { action: ActionType.Raise, amount: minRaise };
    }

    // Strong hands
    if (strength === HandStrengthLevel.Strong) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // 20% check (slow play), 80% bet
        if (random < 0.2) {
          return { action: ActionType.Check, amount: 0 };
        }
        if (availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Bet, amount: gameState.minRaise * 2 };
        }
        return { action: ActionType.Check, amount: 0 };
      }
      // 30% call, 70% raise
      if (random < 0.3 || !availableActions.includes(ActionType.Raise)) {
        if (availableActions.includes(ActionType.Call)) {
          return {
            action: ActionType.Call,
            amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
          };
        }
      }
      const minRaise = this.bettingRules.getMinRaiseAmount(
        bot,
        gameState.currentBet,
        gameState.minRaise
      );
      return { action: ActionType.Raise, amount: minRaise * 2 };
    }

    // Very strong hands
    // 10% check (slow play), 90% bet/raise aggressively
    if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
      if (random < 0.1) {
        return { action: ActionType.Check, amount: 0 };
      }
      if (availableActions.includes(ActionType.Bet)) {
        const betAmount = Math.min(gameState.pot.totalPot, bot.chips);
        return { action: ActionType.Bet, amount: betAmount };
      }
      return { action: ActionType.Check, amount: 0 };
    }

    // Always raise with very strong hands
    if (availableActions.includes(ActionType.Raise)) {
      const raiseAmount = Math.min(gameState.pot.totalPot, bot.chips);
      return { action: ActionType.Raise, amount: raiseAmount };
    }

    if (availableActions.includes(ActionType.Call)) {
      return {
        action: ActionType.Call,
        amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
      };
    }

    // Fallback: fold
    return { action: ActionType.Fold, amount: 0 };
  }

  private getHandStrength(bot: Player, gameState: GameState): HandStrengthLevel {
    if (gameState.phase === GamePhase.Preflop) {
      return this.handAnalyzer.analyzePreflopStrength(bot.holeCards);
    }
    return this.handAnalyzer.analyzePostflopStrength(bot.holeCards, gameState.communityCards);
  }
}
