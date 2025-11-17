/**
 * Hard Bot AI Strategy
 * - Advanced hand reading
 * - Adaptive play based on opponents
 * - High aggression (0.7), tight play (0.6)
 * - Strategic bluffing (20% of time in good situations)
 * - Semi-bluffs with draws
 * - Value betting
 * - Position exploitation
 */

import type { Action } from '@/types';
import {
  calculateHandStrength,
  calculatePreflopStrength,
  calculatePotOdds,
  estimateOuts,
} from '@/game-logic/handStrength';
import type { MediumBotContext } from './mediumBot';

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
 * Calculate implied odds (simplified)
 * How much we can win if we hit our draw
 */
function calculateImpliedOdds(
  outs: number,
  cardsTocome: number,
  potSize: number,
  betToCall: number,
  opponentStack: number
): number {
  if (outs === 0 || cardsTocome === 0) return 0;

  // Probability of hitting
  const hitProbability = 1 - Math.pow((47 - outs) / 47, cardsTocome);

  // Expected value includes potential future bets
  const impliedPot = potSize + Math.min(opponentStack * 0.5, betToCall * 2);

  return impliedPot * hitProbability - betToCall;
}

/**
 * Hard bot decision making
 * Most sophisticated strategy:
 * - Reads opponent betting patterns
 * - Considers implied odds with draws
 * - Strategic bluffing and semi-bluffing
 * - Value betting with strong hands
 * - Position exploitation
 */
export function makeHardBotDecision(context: MediumBotContext): Action {
  const {
    player,
    communityCards,
    currentBet,
    potSize,
    minRaise,
    gamePhase,
    dealerPosition,
    numPlayers,
    activePlayers,
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
    position === 'early' ? 0.75 : position === 'middle' ? 1.0 : 1.3;

  // Adjust for number of active players
  const playerCountMultiplier = activePlayers <= 3 ? 1.2 : activePlayers >= 5 ? 0.9 : 1.0;

  // Adjust hand strength based on position and player count
  const adjustedStrength =
    handStrength * positionMultiplier * playerCountMultiplier;

  // Calculate pot odds
  const potOdds = calculatePotOdds(potSize, callAmount);

  // Estimate outs for drawing hands
  const outs = estimateOuts(player.holeCards, communityCards);
  const cardsTocome = gamePhase === 'flop' ? 2 : gamePhase === 'turn' ? 1 : 0;

  // Hard bot thresholds (more aggressive)
  const FOLD_THRESHOLD = position === 'late' ? 0.2 : 0.25;
  const RAISE_THRESHOLD = position === 'late' ? 0.55 : 0.6;
  const VALUE_BET_THRESHOLD = 0.7;
  const AGGRESSION = position === 'late' ? 0.8 : 0.7;
  const BLUFF_CHANCE = position === 'late' ? 0.25 : 0.15;

  // Bluff conditions (more sophisticated)
  const isGoodBluffSpot =
    position === 'late' &&
    communityCards.length >= 3 &&
    activePlayers <= 2 &&
    Math.random() < BLUFF_CHANCE;

  // Semi-bluff with draws
  const hasDraw = outs >= 8; // Flush draw or open-ended straight draw
  const canSemiBluff = hasDraw && Math.random() < 0.6;

  // Decision logic
  if (canCheck) {
    // No bet to call - we can check or bet

    // Value bet with strong hands
    if (adjustedStrength > VALUE_BET_THRESHOLD) {
      // Strong hand - bet for value
      const betSize =
        adjustedStrength > 0.85
          ? Math.floor(potSize * 0.75) // Large bet with very strong hand
          : Math.floor(potSize * 0.5); // Medium bet with strong hand

      const betAmount = Math.min(Math.max(betSize, minRaise), player.chips);

      return {
        type: 'bet',
        playerId: player.id,
        amount: betAmount,
        timestamp: Date.now(),
      };
    }

    // Semi-bluff with draws
    if (canSemiBluff && communityCards.length < 5) {
      const semiBluffAmount = Math.min(
        Math.floor(potSize * 0.6),
        player.chips
      );
      return {
        type: 'bet',
        playerId: player.id,
        amount: semiBluffAmount,
        timestamp: Date.now(),
      };
    }

    // Bluff in good spots
    if (isGoodBluffSpot) {
      const bluffAmount = Math.min(
        Math.floor(potSize * 0.7),
        player.chips
      );
      return {
        type: 'bet',
        playerId: player.id,
        amount: bluffAmount,
        timestamp: Date.now(),
      };
    }

    // Bet with good hands
    if (adjustedStrength > RAISE_THRESHOLD && Math.random() < AGGRESSION) {
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

  // Fold very weak hands
  if (adjustedStrength < FOLD_THRESHOLD && !hasDraw && !isGoodBluffSpot) {
    return {
      type: 'fold',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // Call or raise with draws based on implied odds
  if (hasDraw && cardsTocome > 0) {
    const impliedOdds = calculateImpliedOdds(
      outs,
      cardsTocome,
      potSize,
      callAmount,
      player.chips
    );

    if (impliedOdds > 0) {
      // Good implied odds - raise as semi-bluff
      if (Math.random() < 0.5 && adjustedStrength > 0.3) {
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

      // Otherwise call
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
  }

  // Marginal hands - consider pot odds
  if (adjustedStrength >= FOLD_THRESHOLD && adjustedStrength < RAISE_THRESHOLD) {
    if (potOdds > 0.35 || adjustedStrength > 0.45) {
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
    // Bad pot odds - fold
    return {
      type: 'fold',
      playerId: player.id,
      amount: 0,
      timestamp: Date.now(),
    };
  }

  // Strong hand - raise aggressively
  if (adjustedStrength > VALUE_BET_THRESHOLD) {
    // Very strong hand - large raise
    const raiseMultiplier = adjustedStrength > 0.85 ? 2.5 : 1.5;
    const raiseAmount = Math.min(
      Math.floor(callAmount + minRaise * raiseMultiplier),
      player.chips
    );

    if (raiseAmount >= player.chips) {
      // All-in with premium hand
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

  // Good hand - raise with some probability
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
