/**
 * Core TypeScript types for Texas Hold'em Poker Game
 * All types use strict TypeScript mode - no 'any' types allowed
 */

// ============================================================================
// Card Types
// ============================================================================

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  readonly rank: Rank;
  readonly suit: Suit;
  readonly id: string; // Unique identifier e.g., "As", "Kh"
}

// ============================================================================
// Hand Types
// ============================================================================

export enum HandRank {
  HighCard = 0,
  Pair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export interface HandResult {
  readonly rank: HandRank;
  readonly description: string;
  readonly cards: ReadonlyArray<Card>;
  readonly value: number; // Numerical value for comparison
}

// ============================================================================
// Player Types
// ============================================================================

export type PlayerType = 'human' | 'bot';
export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly type: PlayerType;
  readonly chips: number;
  readonly holeCards: ReadonlyArray<Card>;
  readonly currentBet: number;
  readonly isFolded: boolean;
  readonly isAllIn: boolean;
  readonly position: number; // 0-5 for 6-max table
  readonly botDifficulty?: BotDifficulty;
}

// ============================================================================
// Action Types
// ============================================================================

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface Action {
  readonly playerId: string;
  readonly type: ActionType;
  readonly amount: number;
  readonly timestamp: number;
}

export interface ValidActions {
  readonly canFold: boolean;
  readonly canCheck: boolean;
  readonly canCall: boolean;
  readonly callAmount: number;
  readonly canBet: boolean;
  readonly canRaise: boolean;
  readonly minRaise: number;
  readonly maxRaise: number;
  readonly canAllIn: boolean;
}

// ============================================================================
// Pot Types
// ============================================================================

export interface SidePot {
  readonly amount: number;
  readonly eligiblePlayerIds: ReadonlyArray<string>;
}

export interface PotStructure {
  readonly mainPot: number;
  readonly sidePots: ReadonlyArray<SidePot>;
  readonly totalPot: number;
}

// ============================================================================
// Game Phase Types
// ============================================================================

export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

// ============================================================================
// Game Settings Types
// ============================================================================

export interface GameSettings {
  readonly numBots: number; // 1-5 bots
  readonly botDifficulty: BotDifficulty | 'mixed';
  readonly startingChips: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly actionTimer: number; // seconds
  readonly animationSpeed: 'off' | 'fast' | 'normal' | 'slow';
  readonly soundEffects: boolean;
  readonly language: 'en' | 'vi' | 'th' | 'zh';
}

// ============================================================================
// Bot Personality Types
// ============================================================================

export interface BotPersonality {
  readonly aggression: number; // 0-1 (passive to aggressive)
  readonly tightness: number; // 0-1 (loose to tight)
  readonly bluffFrequency: number; // 0-1
  readonly adaptability: number; // 0-1
}

// ============================================================================
// Winner Types
// ============================================================================

export interface Winner {
  readonly player: Player;
  readonly hand: HandResult;
  readonly potAmount: number;
}

// ============================================================================
// Game State Context (for XState)
// ============================================================================

export interface PokerContext {
  readonly players: ReadonlyArray<Player>;
  readonly communityCards: ReadonlyArray<Card>;
  readonly pot: PotStructure;
  readonly currentPlayerIndex: number;
  readonly dealerIndex: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly deck: ReadonlyArray<Card>;
  readonly burnedCards: ReadonlyArray<Card>;
  readonly actionHistory: ReadonlyArray<Action>;
  readonly gamePhase: GamePhase | null;
}

// ============================================================================
// Game Events (for XState)
// ============================================================================

export type PokerEvent =
  | { type: 'START_GAME'; settings: GameSettings }
  | { type: 'PLAYER_ACTION'; action: Action }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'COMPLETE_HAND' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' };

// ============================================================================
// UI State Types
// ============================================================================

export interface UIState {
  isSettingsOpen: boolean;
  isStatsOpen: boolean;
  showWinnerAnnouncement: boolean;
  winnerData: Winner | null;
  toast: Toast | null;
}

export interface Toast {
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
  duration: number;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface SessionStats {
  readonly handsPlayed: number;
  readonly handsWon: number;
  readonly totalWinnings: number;
  readonly biggestPot: number;
  readonly bestHand: HandRank | null;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];
