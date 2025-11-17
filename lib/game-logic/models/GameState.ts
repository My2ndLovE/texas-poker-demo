import { Card } from './Card';
import { Player } from './Player';
import { Action } from './Action';
import { PotStructure } from './Pot';

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete';

export interface GameSettings {
  numBots: number;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  actionTimer: number; // seconds (0 = no timer)
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  pot: PotStructure;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  currentBet: number;
  minRaise: number;
  actionHistory: Action[];
  lastActionIndex: number; // Track last player to act in round
  settings: GameSettings;
  handNumber: number;
}

export function createDefaultSettings(): GameSettings {
  return {
    numBots: 5,
    botDifficulty: 'mixed',
    startingChips: 1000,
    smallBlind: 5,
    bigBlind: 10,
    actionTimer: 30,
  };
}

export function createInitialGameState(settings: GameSettings): GameState {
  return {
    phase: 'waiting',
    players: [],
    communityCards: [],
    pot: { mainPot: 0, sidePots: [], totalPot: 0 },
    currentPlayerIndex: -1,
    dealerIndex: 0,
    smallBlindIndex: -1,
    bigBlindIndex: -1,
    currentBet: 0,
    minRaise: settings.bigBlind,
    actionHistory: [],
    lastActionIndex: -1,
    settings,
    handNumber: 0,
  };
}

export function getActivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.status !== 'eliminated');
}

export function getPlayersInHand(state: GameState): Player[] {
  return state.players.filter((p) => p.status !== 'folded' && p.status !== 'eliminated');
}

export function getCurrentPlayer(state: GameState): Player | null {
  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
    return null;
  }
  return state.players[state.currentPlayerIndex];
}
