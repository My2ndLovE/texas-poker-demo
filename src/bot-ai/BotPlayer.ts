import { GameState } from '../game-logic/models/GameState';
import { Player } from '../game-logic/models/Player';
import { HandEvaluator } from '../game-logic/evaluation/HandEvaluator';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export class BotPlayer {
  difficulty: BotDifficulty;
  private handEvaluator: HandEvaluator;

  constructor(difficulty: BotDifficulty = 'medium') {
    this.difficulty = difficulty;
    this.handEvaluator = new HandEvaluator();
  }

  decideAction(player: Player, gameState: GameState): { action: 'fold' | 'check' | 'call' | 'raise'; amount?: number } {
    const callAmount = gameState.currentBet - player.currentBet;
    const canCheck = callAmount === 0;

    // Simple strategy based on hand strength and pot odds
    const handStrength = this.evaluateHandStrength(player, gameState);
    const potOdds = callAmount > 0 ? callAmount / (gameState.pot + callAmount) : 0;

    // Easy bot: Very predictable, tight play
    if (this.difficulty === 'easy') {
      if (handStrength > 0.7) {
        return canCheck ? { action: 'check' } : { action: 'call' };
      } else if (handStrength > 0.5) {
        return canCheck ? { action: 'check' } : { action: 'fold' };
      } else {
        // Even with weak hand, check if free
        return canCheck ? { action: 'check' } : { action: 'fold' };
      }
    }

    // Medium bot: Balanced strategy
    if (this.difficulty === 'medium') {
      if (handStrength > 0.8) {
        // Strong hand: raise or call
        if (Math.random() > 0.6 && player.chips > gameState.bigBlind * 3) {
          const raiseAmount = gameState.currentBet + gameState.bigBlind * 2;
          return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
        }
        return canCheck ? { action: 'check' } : { action: 'call' };
      } else if (handStrength > 0.5) {
        // Medium hand: call or check if pot odds favorable
        if (potOdds < 0.25 || canCheck) {
          return canCheck ? { action: 'check' } : { action: 'call' };
        }
        return { action: 'fold' };
      } else if (handStrength > 0.35) {
        // Weak hand: check if free, fold otherwise (except occasional bluff)
        if (canCheck) return { action: 'check' };
        if (Math.random() > 0.95) {
          // Rare bluff
          const raiseAmount = gameState.currentBet + gameState.bigBlind;
          return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
        }
        return { action: 'fold' };
      } else {
        return canCheck ? { action: 'check' } : { action: 'fold' };
      }
    }

    // Hard bot: Aggressive, reads pot odds
    if (this.difficulty === 'hard') {
      if (handStrength > 0.75) {
        // Strong hand: raise aggressively
        const raiseAmount = gameState.currentBet + gameState.bigBlind * 3;
        return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
      } else if (handStrength > 0.55) {
        // Good hand: raise or call based on pot odds
        if (potOdds < 0.3) {
          return canCheck ? { action: 'check' } : { action: 'call' };
        }
        // Sometimes value raise
        if (Math.random() > 0.7 && player.chips > gameState.bigBlind * 2) {
          const raiseAmount = gameState.currentBet + gameState.bigBlind * 2;
          return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
        }
        return canCheck ? { action: 'check' } : { action: 'call' };
      } else if (handStrength > 0.35) {
        // Medium hand: check/fold, occasional bluff
        if (canCheck) return { action: 'check' };
        if (Math.random() > 0.8 && player.chips > gameState.bigBlind * 3) {
          // Bluff
          const raiseAmount = gameState.currentBet + gameState.bigBlind * 2;
          return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
        }
        return { action: 'fold' };
      } else {
        // Weak hand: check if free, otherwise fold (rare bluff)
        if (canCheck) return { action: 'check' };
        if (Math.random() > 0.9 && player.chips > gameState.bigBlind * 2) {
          const raiseAmount = gameState.currentBet + gameState.bigBlind;
          return { action: 'raise', amount: Math.min(raiseAmount, player.chips + player.currentBet) };
        }
        return { action: 'fold' };
      }
    }

    // Fallback
    return canCheck ? { action: 'check' } : { action: 'fold' };
  }

  private evaluateHandStrength(player: Player, gameState: GameState): number {
    if (player.holeCards.length !== 2) return 0.3;

    // Preflop: use simple card-based evaluation
    if (gameState.phase === 'preflop') {
      return this.evalPreflopStrength(player);
    }

    // Post-flop: use actual hand evaluation
    if (gameState.communityCards.length >= 3) {
      try {
        const allCards = [...player.holeCards, ...gameState.communityCards];
        const hand = this.handEvaluator.evaluateHand(allCards);

        // Map hand rank to strength (0.0-1.0)
        // Rank 0=high card, 1=pair, ..., 9=royal flush
        // Convert to strength: higher rank = higher strength
        let strength = 0.3 + (hand.rank * 0.07); // 0.3-0.93

        // Adjust based on specific hand
        if (hand.rank >= 7) strength = 0.95; // Four of a kind or better
        else if (hand.rank >= 6) strength = 0.88; // Full house
        else if (hand.rank >= 5) strength = 0.80; // Flush
        else if (hand.rank >= 4) strength = 0.72; // Straight
        else if (hand.rank >= 3) strength = 0.65; // Three of a kind
        else if (hand.rank >= 2) strength = 0.55; // Two pair
        else if (hand.rank >= 1) strength = 0.45; // Pair
        else strength = 0.30; // High card

        return Math.min(strength, 1.0);
      } catch (error) {
        // Fallback to preflop evaluation if error
        return this.evalPreflopStrength(player);
      }
    }

    return this.evalPreflopStrength(player);
  }

  private evalPreflopStrength(player: Player): number {
    const [card1, card2] = player.holeCards;

    const rankValues: { [key: string]: number } = {
      '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6,
      '9': 7, 'T': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12
    };

    const rank1 = rankValues[card1.rank];
    const rank2 = rankValues[card2.rank];
    const isPair = rank1 === rank2;
    const isSuited = card1.suit === card2.suit;
    const highCard = Math.max(rank1, rank2);
    const lowCard = Math.min(rank1, rank2);
    const gap = Math.abs(rank1 - rank2);

    let strength = 0.3;

    // Pocket pairs
    if (isPair) {
      if (highCard >= 10) strength = 0.85; // JJ, QQ, KK, AA
      else if (highCard >= 7) strength = 0.70; // 88, 99, TT
      else strength = 0.55; // 22-77
    }
    // High cards
    else if (highCard >= 11) { // K or A
      if (lowCard >= 10) strength = 0.75; // AK, AQ, KQ
      else if (lowCard >= 9) strength = 0.65; // AJ, KJ
      else if (lowCard >= 7) strength = 0.55; // AT, A9, KT
      else strength = 0.45;

      if (isSuited) strength += 0.08;
    }
    else if (highCard >= 10) { // Q or J
      if (lowCard >= 9) strength = 0.60; // QJ, JT
      else if (lowCard >= 7) strength = 0.50;
      else strength = 0.40;

      if (isSuited) strength += 0.08;
    }
    // Suited connectors
    else if (isSuited && gap <= 1) {
      strength = 0.50;
    }
    else if (isSuited && gap <= 3) {
      strength = 0.45;
    }
    // Medium cards
    else if (highCard >= 7) {
      strength = 0.35;
      if (gap <= 2) strength += 0.05;
    }

    return Math.min(strength, 1.0);
  }
}
