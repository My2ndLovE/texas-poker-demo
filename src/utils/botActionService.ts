/**
 * Bot Action Service
 * Handles automatic bot action execution with delays
 */

import type { Player, Card, GamePhase } from '@/types';
import { makeBotDecision, getBotActionDelay } from '@/bot-ai';

export interface BotActionServiceContext {
  currentPlayer: Player;
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
 * Execute a bot action with natural delay
 * Returns a promise that resolves with the action
 */
export async function executeBotAction(
  context: BotActionServiceContext,
  onAction: (action: ReturnType<typeof makeBotDecision>) => void
): Promise<void> {
  const { currentPlayer } = context;

  // Validate it's a bot's turn
  if (currentPlayer.type !== 'bot' || !currentPlayer.botDifficulty) {
    console.warn('executeBotAction called for non-bot player');
    return;
  }

  // Get bot decision
  const action = makeBotDecision({
    player: currentPlayer,
    allPlayers: context.allPlayers,
    communityCards: context.communityCards,
    currentBet: context.currentBet,
    potSize: context.potSize,
    smallBlind: context.smallBlind,
    bigBlind: context.bigBlind,
    dealerIndex: context.dealerIndex,
    gamePhase: context.gamePhase,
  });

  // Add natural delay based on difficulty
  const delay = getBotActionDelay(currentPlayer.botDifficulty);

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Execute action
  onAction(action);
}

/**
 * Check if current player is a bot
 */
export function isCurrentPlayerBot(player: Player): boolean {
  return player.type === 'bot';
}

/**
 * Get human-readable action description for UI
 */
export function getActionDescription(
  action: ReturnType<typeof makeBotDecision>,
  playerName: string
): string {
  switch (action.type) {
    case 'fold':
      return `${playerName} folds`;
    case 'check':
      return `${playerName} checks`;
    case 'call':
      return `${playerName} calls $${action.amount}`;
    case 'bet':
      return `${playerName} bets $${action.amount}`;
    case 'raise':
      return `${playerName} raises to $${action.amount}`;
    case 'all-in':
      return `${playerName} goes all-in for $${action.amount}`;
    default:
      return `${playerName} acts`;
  }
}
