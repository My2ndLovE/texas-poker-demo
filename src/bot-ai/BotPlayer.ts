import { GameState } from '../game-logic/models/GameState';
import { Player } from '../game-logic/models/Player';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export class BotPlayer {
  difficulty: BotDifficulty;

  constructor(difficulty: BotDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  /**
   * Decides bot action based on game state
   * Returns: { action: 'fold' | 'check' | 'call' | 'raise', amount?: number }
   */
  decideAction(player: Player, gameState: GameState): { action: 'fold' | 'check' | 'call' | 'raise'; amount?: number } {
    const callAmount = gameState.currentBet - player.currentBet;
    const canCheck = callAmount === 0;

    // Simple strategy based on hand strength and pot odds
    const handStrength = this.evaluateHandStrength(player, gameState);
    const potOdds = this.calculatePotOdds(callAmount, gameState.pot);

    // Easy bot: Very predictable, tight play
    if (this.difficulty === 'easy') {
      if (handStrength > 0.7) {
        return canCheck ? { action: 'check' } : { action: 'call' };
      } else if (handStrength > 0.5) {
        return canCheck ? { action: 'check' } : { action: 'fold' };
      } else {
        return { action: 'fold' };
      }
    }

    // Medium bot: Balanced strategy
    if (this.difficulty === 'medium') {
      if (handStrength > 0.8) {
        // Strong hand: raise or call
        if (Math.random() > 0.6 && player.chips > gameState.currentBet * 2) {
          return { action: 'raise', amount: gameState.currentBet * 2 };
        }
        return canCheck ? { action: 'check' } : { action: 'call' };
      } else if (handStrength > 0.4) {
        // Medium hand: call or check
        if (potOdds > 0.3 || canCheck) {
          return canCheck ? { action: 'check' } : { action: 'call' };
        }
        return { action: 'fold' };
      } else {
        // Weak hand: fold or bluff occasionally
        if (Math.random() > 0.9 && canCheck) {
          return { action: 'check' };
        }
        return { action: 'fold' };
      }
    }

    // Hard bot: Aggressive, reads pot odds
    if (this.difficulty === 'hard') {
      if (handStrength > 0.75) {
        // Strong hand: raise aggressively
        const raiseAmount = Math.min(
          gameState.currentBet * 3,
          player.chips + player.currentBet
        );
        return { action: 'raise', amount: raiseAmount };
      } else if (handStrength > 0.5) {
        // Medium hand: value bet or call
        if (potOdds > 0.25) {
          return canCheck ? { action: 'check' } : { action: 'call' };
        }
        return { action: 'fold' };
      } else if (handStrength > 0.3) {
        // Weak hand: bluff occasionally
        if (Math.random() > 0.7 && player.chips > gameState.currentBet * 2) {
          return { action: 'raise', amount: gameState.currentBet * 2 };
        }
        return canCheck ? { action: 'check' } : { action: 'fold' };
      } else {
        return { action: 'fold' };
      }
    }

    // Fallback
    return canCheck ? { action: 'check' } : { action: 'fold' };
  }

  /**
   * Evaluates hand strength (0.0 - 1.0)
   * Simplified evaluation based on hole cards
   */
  private evaluateHandStrength(player: Player, gameState: GameState): number {
    if (player.holeCards.length !== 2) return 0.3;

    const [card1, card2] = player.holeCards;

    // Rank values (2=0, A=12)
    const rankValues: { [key: string]: number } = {
      '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6,
      '9': 7, 'T': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12
    };

    const rank1 = rankValues[card1.rank];
    const rank2 = rankValues[card2.rank];
    const isPair = rank1 === rank2;
    const isSuited = card1.suit === card2.suit;
    const highCard = Math.max(rank1, rank2);
    const gap = Math.abs(rank1 - rank2);

    let strength = 0.3; // Base strength

    // Pocket pairs
    if (isPair) {
      strength = 0.5 + (highCard / 24); // AA = 1.0, 22 = 0.5
    }
    // High cards
    else if (highCard >= 10) { // J, Q, K, A
      strength = 0.4 + (highCard / 30);
      if (isSuited) strength += 0.1;
      if (gap <= 4) strength += 0.05; // Connected cards
    }
    // Suited connectors
    else if (isSuited && gap <= 2) {
      strength = 0.45;
    }
    // Medium pairs/high cards
    else if (highCard >= 7) {
      strength = 0.35 + (highCard / 40);
    }

    // Adjust based on phase
    if (gameState.phase !== 'preflop') {
      // After flop, this is very simplified - in reality would use hand evaluator
      strength *= 0.8; // Reduce confidence post-flop without full evaluation
    }

    return Math.min(strength, 1.0);
  }

  /**
   * Calculates pot odds (call amount / pot size)
   */
  private calculatePotOdds(callAmount: number, potSize: number): number {
    if (callAmount === 0) return 1.0;
    if (potSize === 0) return 0.0;
    return callAmount / (potSize + callAmount);
  }
}
