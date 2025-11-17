import { Card } from './Card';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'eliminated';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number; // Total bet in current hand
  status: PlayerStatus;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  position: number; // Seat position at table (0-8)
}

export function createPlayer(
  id: string,
  name: string,
  chips: number,
  position: number,
  isBot: boolean = false,
  botDifficulty?: 'easy' | 'medium' | 'hard'
): Player {
  return {
    id,
    name,
    chips,
    holeCards: [],
    currentBet: 0,
    totalBet: 0,
    status: 'active',
    isBot,
    botDifficulty,
    position,
  };
}

export function isPlayerActive(player: Player): boolean {
  return player.status === 'active' || player.status === 'all-in';
}

export function isPlayerInHand(player: Player): boolean {
  return player.status !== 'folded' && player.status !== 'eliminated';
}

export function canPlayerAct(player: Player): boolean {
  return player.status === 'active' && player.chips > 0;
}
