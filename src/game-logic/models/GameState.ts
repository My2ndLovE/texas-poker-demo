import { Card } from './Card';
import { Player } from './Player';
import { GamePhase } from '@/utils/constants';

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerPosition: number;
  currentPlayerIndex: number;
  phase: GamePhase;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
  actionHistory: Action[];
  showdownResult?: ShowdownResult;
}

export interface ShowdownResult {
  winners: {
    playerId: string;
    handName: string;
    handDescription: string;
    amount: number;
  }[];
  timestamp: number;
}

export interface Action {
  playerId: string;
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';
  amount: number;
  timestamp: number;
}

export function createInitialGameState(
  players: Player[],
  smallBlind: number,
  bigBlind: number
): GameState {
  return {
    players,
    communityCards: [],
    pot: 0,
    currentBet: 0,
    dealerPosition: 0,
    currentPlayerIndex: 0,
    phase: 'preflop',
    smallBlind,
    bigBlind,
    handNumber: 1,
    actionHistory: [],
  };
}
