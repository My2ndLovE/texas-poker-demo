/**
 * Bot AI Main Entry Point
 * Routes bot decisions to appropriate strategy based on difficulty
 */

import type { Player, Card, Action, BotDifficulty, GamePhase } from '@/types';
import { makeEasyBotDecision, type BotDecisionContext } from './easyBot';
import { makeMediumBotDecision, type MediumBotContext } from './mediumBot';
import { makeHardBotDecision } from './hardBot';

export interface BotAIContext {
  player: Player;
  allPlayers: ReadonlyArray<Player>;
  communityCards: ReadonlyArray<Card>;
  currentBet: number;
  potSize: number;
  smallBlind: number;
  bigBlind: number;
  dealerIndex: number;
  gamePhase: GamePhase | null;
}

/**
 * Main bot decision function
 * Routes to appropriate strategy based on bot difficulty
 */
export function makeBotDecision(context: BotAIContext): Action {
  const { player, allPlayers, communityCards, currentBet, potSize, bigBlind, dealerIndex, gamePhase } =
    context;

  // Validate bot player
  if (player.type !== 'bot' || !player.botDifficulty) {
    throw new Error('makeBotDecision called for non-bot player');
  }

  // Calculate minimum raise (big blind or current bet)
  const minRaise = Math.max(bigBlind, currentBet - player.currentBet);

  // Count active players (not folded, not all-in)
  const activePlayers = allPlayers.filter((p) => !p.isFolded && !p.isAllIn).length;

  // Build context for bot decision
  const baseContext: BotDecisionContext = {
    player,
    communityCards,
    currentBet,
    potSize,
    minRaise,
    gamePhase: gamePhase as any,
  };

  const advancedContext: MediumBotContext = {
    ...baseContext,
    dealerPosition: dealerIndex,
    numPlayers: allPlayers.length,
    activePlayers,
  };

  // Route to appropriate strategy
  switch (player.botDifficulty) {
    case 'easy':
      return makeEasyBotDecision(baseContext);

    case 'medium':
      return makeMediumBotDecision(advancedContext);

    case 'hard':
      return makeHardBotDecision(advancedContext);

    default:
      // Fallback to easy
      return makeEasyBotDecision(baseContext);
  }
}

/**
 * Utility: Add small delay for bot actions (makes it feel more natural)
 */
export function getBotActionDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 500; // 500-1000ms
    case 'medium':
      return 800 + Math.random() * 700; // 800-1500ms
    case 'hard':
      return 1000 + Math.random() * 1000; // 1000-2000ms
    default:
      return 500;
  }
}

/**
 * Export strategy functions for testing
 */
export { makeEasyBotDecision } from './easyBot';
export { makeMediumBotDecision } from './mediumBot';
export { makeHardBotDecision } from './hardBot';
export type { BotDecisionContext, MediumBotContext };
