/**
 * Player utility functions
 * Creates and manages player state
 */

import type { Player, PlayerType, BotDifficulty } from '@/types';

/**
 * Creates a new player with initial state
 */
export function createPlayer(
  id: string,
  name: string,
  type: PlayerType,
  chips: number,
  position: number,
  botDifficulty?: BotDifficulty
): Player {
  return {
    id,
    name,
    type,
    chips,
    holeCards: [],
    currentBet: 0,
    isFolded: false,
    isAllIn: false,
    position,
    ...(botDifficulty && { botDifficulty }),
  };
}

/**
 * Updates player with new chips amount
 */
export function updatePlayerChips(player: Player, newChips: number): Player {
  return {
    ...player,
    chips: newChips,
  };
}

/**
 * Marks player as folded
 */
export function foldPlayer(player: Player): Player {
  return {
    ...player,
    isFolded: true,
  };
}

/**
 * Marks player as all-in
 */
export function allInPlayer(player: Player, amount: number): Player {
  return {
    ...player,
    isAllIn: true,
    currentBet: player.currentBet + amount,
    chips: 0,
  };
}

/**
 * Updates player's current bet
 */
export function updatePlayerBet(player: Player, additionalBet: number): Player {
  const newChips = player.chips - additionalBet;

  return {
    ...player,
    currentBet: player.currentBet + additionalBet,
    chips: newChips,
    isAllIn: newChips === 0,
  };
}

/**
 * Resets player for new hand (clears cards, bets, folded status)
 */
export function resetPlayerForNewHand(player: Player): Player {
  return {
    ...player,
    holeCards: [],
    currentBet: 0,
    isFolded: false,
    isAllIn: false,
  };
}

/**
 * Gets active (non-folded, non-all-in) players
 */
export function getActivePlayers(players: ReadonlyArray<Player>): ReadonlyArray<Player> {
  return players.filter((p) => !p.isFolded && !p.isAllIn);
}

/**
 * Gets players still in the hand (not folded)
 */
export function getPlayersInHand(players: ReadonlyArray<Player>): ReadonlyArray<Player> {
  return players.filter((p) => !p.isFolded);
}

/**
 * Checks if player can act (not folded, not all-in, has chips)
 */
export function canPlayerAct(player: Player): boolean {
  return !player.isFolded && !player.isAllIn && player.chips > 0;
}
