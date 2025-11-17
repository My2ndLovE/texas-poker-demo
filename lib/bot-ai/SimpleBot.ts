import { Player } from '../game-logic/models/Player';
import { GameState } from '../game-logic/models/GameState';
import { Action, createAction, ActionType } from '../game-logic/models/Action';
import { bettingRules } from '../game-logic/rules/BettingRules';
import { handEvaluator } from '../game-logic/evaluation/HandEvaluator';
import { HandRank } from '../game-logic/models/Hand';

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

    // Post-flop: evaluate actual hand strength
    try {
      const allCards = [...player.holeCards, ...state.communityCards];
      const handResult = handEvaluator.evaluateHand(allCards);

      // Convert hand rank to strength (0-1)
      // Higher ranks are better
      const rankStrength = handResult.rank / 9; // RoyalFlush is 9, HighCard is 0

      // Adjust based on specific hand
      switch (handResult.rank) {
        case HandRank.RoyalFlush:
        case HandRank.StraightFlush:
          return 1.0;
        case HandRank.FourOfAKind:
          return 0.95;
        case HandRank.FullHouse:
          return 0.85;
        case HandRank.Flush:
          return 0.75;
        case HandRank.Straight:
          return 0.65;
        case HandRank.ThreeOfAKind:
          return 0.55;
        case HandRank.TwoPair:
          return 0.45;
        case HandRank.Pair: {
          // Stronger pairs are better
          const rank1Value = this.getRankValue(player.holeCards[0].rank);
          const rank2Value = this.getRankValue(player.holeCards[1].rank);
          const pairStrength = Math.max(rank1Value, rank2Value) / 14;
          return 0.25 + pairStrength * 0.15; // 0.25-0.40
        }
        case HandRank.HighCard:
        default: {
          // High card strength based on highest card
          const rank1Value = this.getRankValue(player.holeCards[0].rank);
          const rank2Value = this.getRankValue(player.holeCards[1].rank);
          const highCard = Math.max(rank1Value, rank2Value);
          return 0.1 + (highCard / 14) * 0.15; // 0.10-0.25
        }
      }
    } catch (e) {
      // Fallback to preflop evaluation if error
      const rank1Value = this.getRankValue(card1.rank);
      const rank2Value = this.getRankValue(card2.rank);
      return (rank1Value + rank2Value) / 28;
    }
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
