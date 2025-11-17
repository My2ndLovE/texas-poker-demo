import { Player } from '@/game-logic/models/Player';
import { GameState } from '@/game-logic/models/GameState';
import { ActionType, GamePhase } from '@/utils/constants';
import { BettingRules } from '@/game-logic/rules/BettingRules';
import { HandStrengthAnalyzer, HandStrengthLevel } from '../analysis/HandStrength';
import { BotDecision } from './EasyBotStrategy';

export class MediumBotStrategy {
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

    const strength = this.getHandStrength(bot, gameState);
    const potOdds = this.calculatePotOdds(bot, gameState);
    const position = this.getPosition(bot, gameState);
    const random = Math.random();

    // Position-aware decisions
    const isLatePosition = position >= 0.6; // Cutoff or button
    const isEarlyPosition = position <= 0.3;

    // Very weak hands - fold unless free check
    if (strength === HandStrengthLevel.VeryWeak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        return { action: ActionType.Check, amount: 0 };
      }
      // Bluff occasionally in late position (10%)
      if (isLatePosition && random < 0.1 && availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        return { action: ActionType.Raise, amount: minRaise };
      }
      return { action: ActionType.Fold, amount: 0 };
    }

    // Weak hands - consider pot odds
    if (strength === HandStrengthLevel.Weak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // Check or bet based on position
        if (isLatePosition && random < 0.4) {
          if (availableActions.includes(ActionType.Bet)) {
            return { action: ActionType.Bet, amount: gameState.minRaise };
          }
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Call if pot odds are good, otherwise fold
      if (potOdds > 0.3) {
        if (availableActions.includes(ActionType.Call)) {
          return {
            action: ActionType.Call,
            amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
          };
        }
      }
      return { action: ActionType.Fold, amount: 0 };
    }

    // Medium hands - more aggressive in late position
    if (strength === HandStrengthLevel.Medium) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // Bet more often in late position
        const betChance = isLatePosition ? 0.7 : 0.5;
        if (random < betChance && availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Bet, amount: gameState.minRaise * 1.5 };
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Raise or call based on position and pot size
      if (isLatePosition && random < 0.4 && availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        return { action: ActionType.Raise, amount: minRaise * 1.5 };
      }

      if (availableActions.includes(ActionType.Call)) {
        return {
          action: ActionType.Call,
          amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
        };
      }
      return { action: ActionType.Fold, amount: 0 };
    }

    // Strong hands - value betting
    if (strength === HandStrengthLevel.Strong) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // Rarely check, usually bet for value
        if (random < 0.15) {
          return { action: ActionType.Check, amount: 0 };
        }
        if (availableActions.includes(ActionType.Bet)) {
          const betSize = Math.min(gameState.pot.totalPot * 0.7, bot.chips);
          return { action: ActionType.Bet, amount: Math.max(betSize, gameState.minRaise * 2) };
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Usually raise for value
      if (random < 0.7 && availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        const raiseSize = Math.min(gameState.pot.totalPot * 0.7, bot.chips);
        return { action: ActionType.Raise, amount: Math.max(raiseSize, minRaise * 2) };
      }

      if (availableActions.includes(ActionType.Call)) {
        return {
          action: ActionType.Call,
          amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
        };
      }
      return { action: ActionType.Fold, amount: 0 };
    }

    // Very strong hands - maximize value
    if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
      // Occasionally check for deception
      if (random < 0.08) {
        return { action: ActionType.Check, amount: 0 };
      }
      if (availableActions.includes(ActionType.Bet)) {
        const betSize = Math.min(gameState.pot.totalPot, bot.chips);
        return { action: ActionType.Bet, amount: betSize };
      }
      return { action: ActionType.Check, amount: 0 };
    }

    // Always raise/call with very strong hands
    if (availableActions.includes(ActionType.Raise)) {
      const raiseSize = Math.min(gameState.pot.totalPot * 1.2, bot.chips);
      return { action: ActionType.Raise, amount: raiseSize };
    }

    if (availableActions.includes(ActionType.Call)) {
      return {
        action: ActionType.Call,
        amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
      };
    }

    return { action: ActionType.Fold, amount: 0 };
  }

  private getHandStrength(bot: Player, gameState: GameState): HandStrengthLevel {
    if (gameState.phase === GamePhase.Preflop) {
      return this.handAnalyzer.analyzePreflopStrength(bot.holeCards);
    }
    return this.handAnalyzer.analyzePostflopStrength(bot.holeCards, gameState.communityCards);
  }

  private calculatePotOdds(bot: Player, gameState: GameState): number {
    const callAmount = this.bettingRules.getCallAmount(bot, gameState.currentBet);
    if (callAmount === 0) return 1;

    const potAfterCall = gameState.pot.totalPot + callAmount;
    return callAmount / potAfterCall;
  }

  private getPosition(bot: Player, gameState: GameState): number {
    // Return 0-1 value where 1 is button, 0 is early position
    const dealerIndex = gameState.dealerIndex;
    const botIndex = bot.seatIndex;
    const playerCount = gameState.players.length;

    const distanceFromDealer = (botIndex - dealerIndex + playerCount) % playerCount;
    return 1 - distanceFromDealer / playerCount;
  }
}
