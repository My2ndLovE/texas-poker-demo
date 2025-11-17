/**
 * Medium Bot AI Strategy
 * - Position awareness (acts differently based on position)
 * - Considers pot odds
 * - Moderate aggression (0.5), moderate tightness (0.5)
 * - Occasional bluffs (10% of time)
 * - Understands betting patterns
 */

import type { Action } from '@/types';
import {
  calculateHandStrength,
  calculatePreflopStrength,
  calculatePotOdds,
} from '@/game-logic/handStrength';
import type { BotDecisionContext } from './easyBot';

export interface MediumBotContext extends BotDecisionContext {
  dealerPosition: number;
  numPlayers: number;
  activePlayers: number;
}

/**
 * Determine if player is in early, middle, or late position
 */
function getPosition(
  playerPosition: number,
  dealerPosition: number,
  numPlayers: number
): 'early' | 'middle' | 'late' {
  const distanceFromDealer = (playerPosition - dealerPosition + numPlayers) % numPlayers;

  if (numPlayers <= 3) {
    return distanceFromDealer === 1 ? 'early' : 'late';
  }

  if (distanceFromDealer <= 2) return 'early';
  if (distanceFromDealer >= numPlayers - 2) return 'late';
  return 'middle';
}

/**
 * Medium bot decision making
 * More sophisticated than easy bot:
 * - Considers position
 * - Calculates pot odds
 * - Varies play based on hand category
 * - Occasional bluffs
 */
export function makeMediumBotDecision(context: MediumBotContext): Action {
  const {
    player,
    communityCards,
    currentBet,
    potSize,
    minRaise,
    gamePhase,
    dealerPosition,
    numPlayers,
  } = context;

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

  // Position awareness
  const position = getPosition(player.position, dealerPosition, numPlayers);
  const positionMultiplier =
    position === 'early' ? 0.8 : position === 'middle' ? 1.0 : 1.2;

  // Adjust hand strength based on position
  const adjustedStrength = handStrength * positionMultiplier;

  // Calculate pot odds
  const potOdds = calculatePotOdds(potSize, callAmount);

  // Medium bot thresholds (adjusted by position)
  const FOLD_THRESHOLD = position === 'late' ? 0.25 : 0.3;
  const RAISE_THRESHOLD = position === 'late' ? 0.65 : 0.7;
  const AGGRESSION = position === 'late' ? 0.6 : 0.5;
  const BLUFF_CHANCE = position === 'late' ? 0.15 : 0.1;

  // Bluff occasionally in late position
  const isBluffing = Math.random() < BLUFF_CHANCE && position === 'late';

  // Decision logic
  if (canCheck) {
    // No bet to call - we can check or bet

    // Bluff bet occasionally in late position
    if (isBluffing && communityCards.length > 0) {
      const bluffAmount = Math.min(Math.floor(minRaise * 0.5), player.chips);
      return {
        type: 'bet',
        playerId: player.id,
        amount: bluffAmount,
        timestamp: Date.now(),
      };
    }

    if (adjustedStrength > RAISE_THRESHOLD && Math.random() < AGGRESSION) {
      // Good hand - bet
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

  // Fold if hand is too weak
  if (adjustedStrength < FOLD_THRESHOLD && !isBluffing) {
    return {
      type: 'fold',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // Consider pot odds for marginal hands
  if (adjustedStrength >= FOLD_THRESHOLD && adjustedStrength < RAISE_THRESHOLD) {
    // Marginal hand - use pot odds
    if (potOdds > 0.3 || adjustedStrength > 0.4) {
      // Good pot odds or decent hand - call
      const finalCallAmount = Math.min(callAmount, player.chips);
      if (finalCallAmount >= player.chips) {
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
    // Bad pot odds and marginal hand - fold
    return {
      type: 'fold',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // Strong hand - raise with some probability
  if (adjustedStrength > RAISE_THRESHOLD && Math.random() < AGGRESSION) {
    const raiseAmount = Math.min(callAmount + minRaise, player.chips);
    if (raiseAmount >= player.chips) {
      return {
        type: 'all-in',
        playerId: player.id,
        amount: player.chips,
        timestamp: Date.now(),
      };
    }
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
