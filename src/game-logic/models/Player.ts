import { Card } from './Card';
import { PlayerStatus } from '@/utils/constants';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number;
  status: PlayerStatus;
  seatIndex: number;
  isBot: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
}

export const createPlayer = (
  id: string,
  name: string,
  chips: number,
  seatIndex: number,
  isBot: boolean
): Player => ({
  id,
  name,
  chips,
  holeCards: [],
  currentBet: 0,
  totalBet: 0,
  status: PlayerStatus.Active,
  seatIndex,
  isBot,
  isDealer: false,
  isSmallBlind: false,
  isBigBlind: false,
});
