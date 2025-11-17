import { handEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import { bettingRules } from '@/game-logic/rules/BettingRules';
import type { ActionType, Card, GameState, Player } from '@/types';

export interface BotDecision {
  action: ActionType;
  amount: number;
}

/**
 * Base class for bot strategies
 */
export abstract class BotStrategy {
  /**
   * Make a decision for the bot
   */
  abstract makeDecision(player: Player, gameState: GameState): BotDecision;

  /**
   * Get hand strength (0-1)
   */
  protected getHandStrength(player: Player, communityCards: Card[]): number {
    const allCards = [...player.holeCards, ...communityCards];
    return handEvaluator.getHandStrength(allCards);
  }

  /**
   * Calculate pot odds
   */
  protected getPotOdds(player: Player, gameState: GameState): number {
    const callAmount = bettingRules.getCallAmount(player, gameState);
    if (callAmount === 0) return 0;

    const potAfterCall = gameState.pot.totalPot + callAmount;
    return callAmount / potAfterCall;
  }

  /**
   * Get random thinking delay (ms)
   */
  getThinkingDelay(): number {
    return Math.random() * 1000 + 500; // 500-1500ms
  }
}

/**
 * Easy bot - simple strategy
 */
export class EasyBotStrategy extends BotStrategy {
  makeDecision(player: Player, gameState: GameState): BotDecision {
    const handStrength = this.getHandStrength(player, gameState.communityCards);
    const validActions = bettingRules.getValidActions(player, gameState);

    // Fold if hand is weak (< 0.3)
    if (handStrength < 0.3 && validActions.includes('fold')) {
      return { action: 'fold', amount: 0 };
    }

    // Check if possible
    if (validActions.includes('check')) {
      return { action: 'check', amount: 0 };
    }

    // Call with decent hands (>= 0.3)
    if (handStrength >= 0.3 && validActions.includes('call')) {
      return { action: 'call', amount: bettingRules.getCallAmount(player, gameState) };
    }

    // Bet/raise with strong hands (>= 0.7)
    if (handStrength >= 0.7) {
      if (validActions.includes('bet')) {
        return { action: 'bet', amount: gameState.bigBlindAmount * 2 };
      }
      if (validActions.includes('raise')) {
        const callAmount = bettingRules.getCallAmount(player, gameState);
        const minRaise = bettingRules.getMinimumRaise(gameState);
        // CRITICAL FIX: For raise, pass call amount + raise amount
        return { action: 'raise', amount: callAmount + minRaise };
      }
    }

    // Default: fold
    return { action: 'fold', amount: 0 };
  }

  getThinkingDelay(): number {
    return Math.random() * 1500 + 500; // 500-2000ms
  }
}

/**
 * Medium bot - considers pot odds and position
 */
export class MediumBotStrategy extends BotStrategy {
  makeDecision(player: Player, gameState: GameState): BotDecision {
    const handStrength = this.getHandStrength(player, gameState.communityCards);
    const potOdds = this.getPotOdds(player, gameState);
    const validActions = bettingRules.getValidActions(player, gameState);

    // Fold weak hands (< 0.25)
    if (handStrength < 0.25 && validActions.includes('fold')) {
      return { action: 'fold', amount: 0 };
    }

    // Check if free
    if (validActions.includes('check')) {
      // Sometimes bet with good hands
      if (handStrength >= 0.6 && Math.random() > 0.5 && validActions.includes('bet')) {
        return { action: 'bet', amount: gameState.pot.totalPot * 0.5 };
      }
      return { action: 'check', amount: 0 };
    }

    // Call if pot odds are favorable (hand strength > pot odds)
    if (validActions.includes('call') && handStrength > potOdds) {
      return { action: 'call', amount: bettingRules.getCallAmount(player, gameState) };
    }

    // Raise with strong hands (>= 0.7)
    if (handStrength >= 0.7 && validActions.includes('raise')) {
      const callAmount = bettingRules.getCallAmount(player, gameState);
      const raiseSize = gameState.pot.totalPot * 0.75;
      // CRITICAL FIX: For raise, pass call amount + raise size
      const totalAmount = callAmount + raiseSize;
      return { action: 'raise', amount: Math.min(totalAmount, player.chips) };
    }

    // Occasionally bluff (10% of time)
    if (Math.random() < 0.1 && validActions.includes('raise')) {
      const callAmount = bettingRules.getCallAmount(player, gameState);
      const bluffSize = gameState.bigBlindAmount * 3;
      // CRITICAL FIX: For raise, pass call amount + bluff size
      return { action: 'raise', amount: callAmount + bluffSize };
    }

    // Default: fold
    return { action: 'fold', amount: 0 };
  }

  getThinkingDelay(): number {
    return Math.random() * 2000 + 1000; // 1000-3000ms
  }
}

/**
 * Hard bot - advanced strategy
 */
export class HardBotStrategy extends BotStrategy {
  makeDecision(player: Player, gameState: GameState): BotDecision {
    const handStrength = this.getHandStrength(player, gameState.communityCards);
    const potOdds = this.getPotOdds(player, gameState);
    const validActions = bettingRules.getValidActions(player, gameState);
    const personality = player.botPersonality || {
      tightness: 0.5,
      aggression: 0.5,
      bluffFrequency: 0.2,
      adaptability: 0.5,
    };

    // Adjust thresholds based on personality
    const foldThreshold = 0.15 + personality.tightness * 0.2;
    const raiseThreshold = 0.6 - personality.aggression * 0.2;

    // Fold very weak hands
    if (handStrength < foldThreshold && validActions.includes('fold')) {
      return { action: 'fold', amount: 0 };
    }

    // Check if free
    if (validActions.includes('check')) {
      // Trap with very strong hands (slow play)
      if (handStrength >= 0.9 && Math.random() > 0.7) {
        return { action: 'check', amount: 0 };
      }

      // Bet with good hands based on aggression
      if (
        handStrength >= raiseThreshold &&
        Math.random() < personality.aggression &&
        validActions.includes('bet')
      ) {
        const betSize = gameState.pot.totalPot * (0.5 + personality.aggression * 0.5);
        return { action: 'bet', amount: Math.min(betSize, player.chips) };
      }

      return { action: 'check', amount: 0 };
    }

    // Advanced call/fold decision
    if (validActions.includes('call')) {
      const callAmount = bettingRules.getCallAmount(player, gameState);

      // Consider implied odds (simplified)
      const impliedOdds = potOdds * 0.8; // Discount for future betting

      if (handStrength > impliedOdds) {
        return { action: 'call', amount: callAmount };
      }

      // Sometimes call with medium hands if pot is large
      if (handStrength >= 0.4 && gameState.pot.totalPot > player.chips * 0.3) {
        return { action: 'call', amount: callAmount };
      }
    }

    // Strategic raising
    if (handStrength >= raiseThreshold && validActions.includes('raise')) {
      const callAmount = bettingRules.getCallAmount(player, gameState);

      // Vary bet sizing based on hand strength and situation
      let raiseFactor = 0.5 + handStrength * 0.5;
      if (gameState.communityCards.length === 0) {
        // Preflop - smaller raises
        raiseFactor *= 0.5;
      }

      const raiseSize = gameState.pot.totalPot * raiseFactor * (1 + personality.aggression * 0.5);
      // CRITICAL FIX: For raise, pass call amount + raise size
      const totalAmount = callAmount + raiseSize;
      return { action: 'raise', amount: Math.min(totalAmount, player.chips) };
    }

    // Strategic bluffing
    if (
      Math.random() < personality.bluffFrequency &&
      gameState.communityCards.length >= 3 &&
      validActions.includes('raise')
    ) {
      const callAmount = bettingRules.getCallAmount(player, gameState);
      const bluffSize = gameState.pot.totalPot * 0.8;
      // CRITICAL FIX: For raise, pass call amount + bluff size
      const totalAmount = callAmount + bluffSize;
      return { action: 'raise', amount: Math.min(totalAmount, player.chips) };
    }

    // Default: fold
    return { action: 'fold', amount: 0 };
  }

  getThinkingDelay(): number {
    return Math.random() * 2500 + 1500; // 1500-4000ms
  }
}

/**
 * Factory to create bot strategy based on difficulty
 */
export function createBotStrategy(difficulty: 'easy' | 'medium' | 'hard'): BotStrategy {
  switch (difficulty) {
    case 'easy':
      return new EasyBotStrategy();
    case 'medium':
      return new MediumBotStrategy();
    case 'hard':
      return new HardBotStrategy();
    default:
      return new MediumBotStrategy();
  }
}
