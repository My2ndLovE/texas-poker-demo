import { Card } from './Card';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'eliminated';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  status: PlayerStatus;
  isBot: boolean;
  position: number; // 0-8, seat at table
}

export function createPlayer(
  id: string,
  name: string,
  chips: number,
  position: number,
  isBot: boolean = false
): Player {
  return {
    id,
    name,
    chips,
    holeCards: [],
    currentBet: 0,
    status: 'active',
    isBot,
    position,
  };
}
