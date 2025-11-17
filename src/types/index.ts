// Core poker types

export type Suit = 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // unique identifier for React keys
}

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
  rank: HandRank;
  description: string; // e.g., "Straight, King High"
  cards: Card[]; // The 5 cards that make up the hand
  value: number; // Numeric value for comparison
}

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'eliminated' | 'waiting';
export type PlayerType = 'human' | 'bot';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number; // Total bet in current hand
  status: PlayerStatus;
  seatIndex: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  // Bot-specific fields
  botDifficulty?: 'easy' | 'medium' | 'hard';
  botPersonality?: BotPersonality;
}

export interface BotPersonality {
  tightness: number; // 0-1: 0 = very loose, 1 = very tight
  aggression: number; // 0-1: 0 = passive, 1 = aggressive
  bluffFrequency: number; // 0-1: how often they bluff
  adaptability: number; // 0-1: how much they adjust to opponents
}

export type GamePhase = 'menu' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'hand-complete' | 'game-over';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface PlayerAction {
  playerId: string;
  type: ActionType;
  amount: number;
  timestamp: number;
}

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotStructure {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  pot: PotStructure;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  minimumRaise: number;
  deck: Card[];
  burnedCards: Card[];
  actionHistory: PlayerAction[];
  handNumber: number;
  lastAction?: PlayerAction;
}

export interface GameSettings {
  numBots: number; // 1-8
  botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  startingChips: number; // 500, 1000, 2000, 5000
  blindLevel: {
    small: number;
    big: number;
  };
  actionTimer: number; // seconds (0 = off)
  animationSpeed: 'off' | 'fast' | 'normal' | 'slow';
  soundEffects: boolean;
  cardBackDesign: string;
  language: 'en' | 'vi' | 'th' | 'zh';
}

export interface SessionStats {
  handsPlayed: number;
  handsWon: number;
  winRate: number;
  totalChipsWon: number;
  biggestPotWon: number;
  currentChips: number;
  handsWonByType: Record<HandRank, number>;
}

export interface WinnerData {
  playerId: string;
  playerName: string;
  hand: HandResult;
  amount: number;
  potType: 'main' | 'side';
}

// Type guards
export function isHumanPlayer(player: Player): boolean {
  return player.type === 'human';
}

export function isBotPlayer(player: Player): boolean {
  return player.type === 'bot';
}

export function isActivePlayer(player: Player): boolean {
  return player.status === 'active';
}

export function canPlayerAct(player: Player): boolean {
  return (
    player.status === 'active' &&
    player.chips > 0
  );
}

// Utility types
export type Position = {
  x: number;
  y: number;
};

export type BotDecisionContext = {
  gameState: GameState;
  player: Player;
  potOdds: number;
  handStrength: number;
};
