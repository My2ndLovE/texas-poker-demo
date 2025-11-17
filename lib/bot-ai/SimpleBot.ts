import { Player } from '../game-logic/models/Player';
import { GameState } from '../game-logic/models/GameState';
import { Action, createAction, ActionType } from '../game-logic/models/Action';
import { bettingRules } from '../game-logic/rules/BettingRules';

// Simple bot AI for MVP - can be enhanced later
export class SimpleBot {
  // Decide action for a bot player
  decideAction(state: GameState, player: Player): Action {
    const validActions = bettingRules.getValidActions(state, player);

    // Simple strategy based on difficulty
    const difficulty = player.botDifficulty || 'medium';
    const handStrength = this.evaluateHandStrength(player, state);

    // Easy bot: mostly passive, folds weak hands
    if (difficulty === 'easy') {
      if (handStrength < 0.3) {
        return createAction('fold', player.id);
      }
      if (validActions.canCheck) {
        return createAction('check', player.id);
      }
      if (validActions.canCall && handStrength > 0.5) {
        return createAction('call', player.id, validActions.callAmount);
      }
      return createAction('fold', player.id);
    }

    // Medium bot: balanced play
    if (difficulty === 'medium') {
      if (handStrength < 0.2) {
        return createAction('fold', player.id);
      }
      if (validActions.canCheck) {
        if (Math.random() < 0.8) {
          return createAction('check', player.id);
        }
      }
      if (validActions.canCall && handStrength > 0.4) {
        if (handStrength > 0.7 && validActions.canRaise && Math.random() < 0.3) {
          const raiseAmount = validActions.minRaise + Math.floor(Math.random() * state.settings.bigBlind * 2);
          return createAction('raise', player.id, Math.min(raiseAmount, player.chips));
        }
        return createAction('call', player.id, validActions.callAmount);
      }
      return createAction('fold', player.id);
    }

    // Hard bot: aggressive and smart
    if (handStrength < 0.15) {
      return createAction('fold', player.id);
    }
    if (validActions.canRaise && handStrength > 0.6 && Math.random() < 0.4) {
      const raiseAmount = validActions.minRaise + state.settings.bigBlind * 3;
      return createAction('raise', player.id, Math.min(raiseAmount, player.chips));
    }
    if (validActions.canCheck) {
      if (handStrength > 0.5 && Math.random() < 0.2) {
        const betAmount = state.settings.bigBlind * 2;
        return createAction('bet', player.id, Math.min(betAmount, player.chips));
      }
      return createAction('check', player.id);
    }
    if (validActions.canCall && handStrength > 0.3) {
      return createAction('call', player.id, validActions.callAmount);
    }

    return createAction('fold', player.id);
  }

  // Simple hand strength evaluation (0-1)
  private evaluateHandStrength(player: Player, state: GameState): number {
    if (player.holeCards.length !== 2) return 0;

    const [card1, card2] = player.holeCards;

    // Preflop strength
    if (state.communityCards.length === 0) {
      // Pocket pairs
      if (card1.rank === card2.rank) {
        const rankValue = this.getRankValue(card1.rank);
        return 0.6 + (rankValue / 14) * 0.4; // 0.6-1.0 for pairs
      }

      // High cards
      const rank1Value = this.getRankValue(card1.rank);
      const rank2Value = this.getRankValue(card2.rank);
      const avgRank = (rank1Value + rank2Value) / 2;
      const suited = card1.suit === card2.suit ? 0.1 : 0;

      return Math.min(1, (avgRank / 14) * 0.5 + suited);
    }

    // Post-flop: random for now (would use hand evaluator in full version)
    return Math.random() * 0.5 + 0.3;
  }

  private getRankValue(rank: string): number {
    const ranks: Record<string, number> = {
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      'T': 10,
      'J': 11,
      'Q': 12,
      'K': 13,
      'A': 14,
    };
    return ranks[rank] || 0;
  }
}

// Singleton instance
export const simpleBot = new SimpleBot();
