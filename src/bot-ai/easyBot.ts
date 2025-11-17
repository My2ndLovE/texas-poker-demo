/**
 * Easy Bot AI Strategy
 * - Random actions with basic hand evaluation
 * - Folds bad hands, calls good hands
 * - Low aggression (0.3), low tightness (0.3)
 * - No bluffing, no position awareness
 */

import type { Player, Card, Action } from '@/types';
import { calculateHandStrength, calculatePreflopStrength } from '@/game-logic/handStrength';

export interface BotDecisionContext {
  player: Player;
  communityCards: ReadonlyArray<Card>;
  currentBet: number;
  potSize: number;
  minRaise: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | null;
}

/**
 * Easy bot decision making
 * Very simple strategy: fold bad hands, call decent hands, rarely raise
 */
export function makeEasyBotDecision(context: BotDecisionContext): Action {
  const { player, communityCards, currentBet, minRaise, gamePhase } = context;

  // Calculate what we need to call
  const callAmount = currentBet - player.currentBet;
  const canCheck = callAmount === 0;

  // Calculate hand strength
  let handStrength: number;
  if (gamePhase === 'preflop' || communityCards.length === 0) {
    handStrength = calculatePreflopStrength(player.holeCards);
  } else {
    handStrength = calculateHandStrength(player.holeCards, communityCards);
  }

  // Easy bot thresholds
  const FOLD_THRESHOLD = 0.2; // Fold if hand strength < 0.2
  const RAISE_THRESHOLD = 0.75; // Raise if hand strength > 0.75
  const AGGRESSION = 0.3; // 30% chance to raise with good hand

  // Decision logic
  if (canCheck) {
    // No bet to call - we can check or bet
    if (handStrength > RAISE_THRESHOLD && Math.random() < AGGRESSION) {
      // Occasionally bet with very good hands
      const betAmount = Math.min(minRaise, player.chips);
      return {
        type: 'bet',
        playerId: player.id,
        amount: betAmount,
        timestamp: Date.now(),
      };
    }
    // Otherwise check
    return {
      type: 'check',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // There's a bet to call
  if (handStrength < FOLD_THRESHOLD) {
    // Bad hand - fold
    return {
      type: 'fold',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // Decent hand
  if (handStrength > RAISE_THRESHOLD && Math.random() < AGGRESSION) {
    // Very good hand - occasionally raise
    const raiseAmount = Math.min(callAmount + minRaise, player.chips);
    return {
      type: 'raise',
      playerId: player.id,
      amount: raiseAmount,
      timestamp: Date.now(),
    };
  }

  // Default: call
  const finalCallAmount = Math.min(callAmount, player.chips);
  if (finalCallAmount >= player.chips) {
    // Going all-in
    return {
      type: 'all-in',
      playerId: player.id,
      amount: player.chips,
      timestamp: Date.now(),
    };
  }

  return {
    type: 'call',
    playerId: player.id,
    amount: finalCallAmount,
    timestamp: Date.now(),
  };
}
