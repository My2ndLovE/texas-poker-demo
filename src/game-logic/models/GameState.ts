import { Card } from './Card';
import { Player } from './Player';
import { Action } from './Action';
import { GamePhase } from '@/utils/constants';
import type { PotResult } from '../pot/PotCalculator';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  pot: PotResult;
  currentBet: number;
  minRaise: number;
  dealerIndex: number;
  currentPlayerIndex: number;
  smallBlind: number;
  bigBlind: number;
  deck: Card[];
  burnedCards: Card[];
  actionHistory: Action[];
  handNumber: number;
}

export const createInitialGameState = (
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  dealerIndex: number = 0
): GameState => ({
  phase: GamePhase.WaitingToStart,
  players,
  communityCards: [],
  pot: { mainPot: 0, sidePots: [], totalPot: 0, mainPotEligiblePlayers: [] },
  currentBet: 0,
  minRaise: bigBlind,
  dealerIndex,
  currentPlayerIndex: -1,
  smallBlind,
  bigBlind,
  deck: [],
  burnedCards: [],
  actionHistory: [],
  handNumber: 0,
});
