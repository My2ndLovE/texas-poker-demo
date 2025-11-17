import { Player } from '@/game-logic/models/Player';
import { GameState } from '@/game-logic/models/GameState';
import { ActionType, GamePhase, PlayerStatus } from '@/utils/constants';
import { BettingRules } from '@/game-logic/rules/BettingRules';
import { HandStrengthAnalyzer, HandStrengthLevel } from '../analysis/HandStrength';
import { BotDecision } from './EasyBotStrategy';

export class HardBotStrategy {
  private bettingRules: BettingRules;
  private handAnalyzer: HandStrengthAnalyzer;
  private aggressionHistory: Map<string, number> = new Map();

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
    const impliedOdds = this.calculateImpliedOdds(bot, gameState, potOdds);
    const position = this.getPosition(bot, gameState);
    const stackToPotRatio = bot.chips / Math.max(gameState.pot.totalPot, 1);
    const random = Math.random();

    const isLatePosition = position >= 0.6;
    const isEarlyPosition = position <= 0.3;
    const isDeepStacked = stackToPotRatio > 5;

    // Advanced preflop strategy
    if (gameState.phase === GamePhase.Preflop) {
      return this.decidePreflop(
        bot,
        gameState,
        strength,
        position,
        isLatePosition,
        isEarlyPosition,
        availableActions
      );
    }

    // Postflop strategy with advanced concepts
    // Very weak hands - fold unless excellent implied odds
    if (strength === HandStrengthLevel.VeryWeak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        return { action: ActionType.Check, amount: 0 };
      }

      // Bluff with position and fold equity
      if (isLatePosition && random < 0.15 && this.hasFoldEquity(gameState)) {
        if (availableActions.includes(ActionType.Raise)) {
          const bluffSize = Math.min(gameState.pot.totalPot * 0.6, bot.chips);
          return { action: ActionType.Raise, amount: bluffSize };
        }
      }

      return { action: ActionType.Fold, amount: 0 };
    }

    // Weak hands - drawing hands with implied odds
    if (strength === HandStrengthLevel.Weak) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // Check or bet based on position
        if (isLatePosition && random < 0.5) {
          if (availableActions.includes(ActionType.Bet)) {
            return { action: ActionType.Bet, amount: gameState.minRaise };
          }
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Call with good implied odds
      if (impliedOdds > 0.25) {
        if (availableActions.includes(ActionType.Call)) {
          return {
            action: ActionType.Call,
            amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
          };
        }
      }

      // Semi-bluff occasionally
      if (isLatePosition && random < 0.2 && availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        return { action: ActionType.Raise, amount: minRaise * 1.5 };
      }

      return { action: ActionType.Fold, amount: 0 };
    }

    // Medium hands - balanced strategy
    if (strength === HandStrengthLevel.Medium) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        const betChance = isLatePosition ? 0.8 : 0.6;
        if (random < betChance && availableActions.includes(ActionType.Bet)) {
          const betSize = Math.min(gameState.pot.totalPot * 0.6, bot.chips);
          return { action: ActionType.Bet, amount: Math.max(betSize, gameState.minRaise * 2) };
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Raise for value and protection
      if (random < 0.5 && availableActions.includes(ActionType.Raise)) {
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

    // Strong hands - value extraction
    if (strength === HandStrengthLevel.Strong) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        // Check-raise occasionally for deception
        if (random < 0.12 && !isLatePosition) {
          return { action: ActionType.Check, amount: 0 };
        }
        if (availableActions.includes(ActionType.Bet)) {
          const betSize = Math.min(gameState.pot.totalPot * 0.75, bot.chips);
          return { action: ActionType.Bet, amount: Math.max(betSize, gameState.minRaise * 3) };
        }
        return { action: ActionType.Check, amount: 0 };
      }

      // Raise for value
      if (availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        const raiseSize = Math.min(gameState.pot.totalPot * 0.8, bot.chips);
        return { action: ActionType.Raise, amount: Math.max(raiseSize, minRaise * 3) };
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
      // Slow play occasionally when deep-stacked
      if (random < 0.05 && isDeepStacked) {
        return { action: ActionType.Check, amount: 0 };
      }
      if (availableActions.includes(ActionType.Bet)) {
        const betSize = Math.min(gameState.pot.totalPot * 1.5, bot.chips);
        return { action: ActionType.Bet, amount: betSize };
      }
      return { action: ActionType.Check, amount: 0 };
    }

    // Always raise/call with very strong hands
    if (availableActions.includes(ActionType.Raise)) {
      const raiseSize = Math.min(gameState.pot.totalPot * 1.5, bot.chips);
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

  private decidePreflop(
    bot: Player,
    gameState: GameState,
    strength: HandStrengthLevel,
    position: number,
    isLatePosition: boolean,
    isEarlyPosition: boolean,
    availableActions: ActionType[]
  ): BotDecision {
    const random = Math.random();

    // Very strong preflop hands - always aggressive
    if (strength === HandStrengthLevel.VeryStrong) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        if (availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Bet, amount: gameState.bigBlind * 3 };
        }
        return { action: ActionType.Check, amount: 0 };
      }

      if (availableActions.includes(ActionType.Raise)) {
        const minRaise = this.bettingRules.getMinRaiseAmount(
          bot,
          gameState.currentBet,
          gameState.minRaise
        );
        return { action: ActionType.Raise, amount: minRaise * 3 };
      }

      if (availableActions.includes(ActionType.Call)) {
        return {
          action: ActionType.Call,
          amount: this.bettingRules.getCallAmount(bot, gameState.currentBet),
        };
      }
    }

    // Position-based opening ranges
    if (strength >= HandStrengthLevel.Medium) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        if (availableActions.includes(ActionType.Bet)) {
          return { action: ActionType.Bet, amount: gameState.bigBlind * 2.5 };
        }
      }
    }

    // Tighten up in early position
    if (isEarlyPosition && strength < HandStrengthLevel.Strong) {
      if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
        return { action: ActionType.Check, amount: 0 };
      }
      return { action: ActionType.Fold, amount: 0 };
    }

    // Default: follow basic strategy
    if (this.bettingRules.canCheck(bot, gameState.currentBet)) {
      return { action: ActionType.Check, amount: 0 };
    }

    if (strength >= HandStrengthLevel.Weak && availableActions.includes(ActionType.Call)) {
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

  private calculateImpliedOdds(bot: Player, gameState: GameState, potOdds: number): number {
    // Estimate future betting potential
    const avgOpponentStack = this.getAverageOpponentStack(gameState);
    const futureBetting = avgOpponentStack * 0.3; // Estimate 30% of stack can be won
    const totalPot = gameState.pot.totalPot + futureBetting;
    const callAmount = this.bettingRules.getCallAmount(bot, gameState.currentBet);

    if (callAmount === 0) return 1;
    return callAmount / totalPot;
  }

  private getAverageOpponentStack(gameState: GameState): number {
    const opponents = gameState.players.filter((p) => p.chips > 0);
    if (opponents.length === 0) return 0;
    return opponents.reduce((sum, p) => sum + p.chips, 0) / opponents.length;
  }

  private getPosition(bot: Player, gameState: GameState): number {
    const dealerIndex = gameState.dealerIndex;
    const botIndex = bot.seatIndex;
    const playerCount = gameState.players.length;

    const distanceFromDealer = (botIndex - dealerIndex + playerCount) % playerCount;
    return 1 - distanceFromDealer / playerCount;
  }

  private hasFoldEquity(gameState: GameState): boolean {
    // Check if opponents are likely to fold
    const activePlayers = gameState.players.filter((p) => p.status !== PlayerStatus.Out);
    return activePlayers.length <= 3 && gameState.pot.totalPot < gameState.bigBlind * 10;
  }
}
