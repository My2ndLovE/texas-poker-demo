// Card constants
export const SUITS = ['h', 'd', 'c', 's'] as const;
export const SUIT_NAMES = {
  h: 'Hearts',
  d: 'Diamonds',
  c: 'Clubs',
  s: 'Spades',
} as const;

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
export const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
} as const;

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

// Hand ranks (0-9)
export enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export const HAND_RANK_NAMES = {
  [HandRank.HighCard]: 'High Card',
  [HandRank.OnePair]: 'One Pair',
  [HandRank.TwoPair]: 'Two Pair',
  [HandRank.ThreeOfAKind]: 'Three of a Kind',
  [HandRank.Straight]: 'Straight',
  [HandRank.Flush]: 'Flush',
  [HandRank.FullHouse]: 'Full House',
  [HandRank.FourOfAKind]: 'Four of a Kind',
  [HandRank.StraightFlush]: 'Straight Flush',
  [HandRank.RoyalFlush]: 'Royal Flush',
} as const;

// Action types
export enum ActionType {
  Fold = 'fold',
  Check = 'check',
  Call = 'call',
  Bet = 'bet',
  Raise = 'raise',
  AllIn = 'allin',
}

// Game phases
export enum GamePhase {
  WaitingToStart = 'waiting',
  Preflop = 'preflop',
  Flop = 'flop',
  Turn = 'turn',
  River = 'river',
  Showdown = 'showdown',
  HandComplete = 'handComplete',
}

// Player status
export enum PlayerStatus {
  Active = 'active',
  Folded = 'folded',
  AllIn = 'allin',
  Out = 'out',
}

// Blind levels
export const BLIND_LEVELS = [
  { small: 5, big: 10 },
  { small: 10, big: 20 },
  { small: 25, big: 50 },
  { small: 50, big: 100 },
] as const;

// Starting chips options
export const STARTING_CHIPS_OPTIONS = [500, 1000, 2000, 5000] as const;

// Timer durations (milliseconds)
export const ACTION_TIMER_DURATIONS = {
  off: 0,
  short: 15000,
  normal: 30000,
  long: 60000,
} as const;

// Bot thinking delays (milliseconds)
export const BOT_THINKING_DELAY = {
  easy: { min: 500, max: 2000 },
  medium: { min: 1000, max: 3000 },
  hard: { min: 1500, max: 3500 },
} as const;

// Animation speeds
export const ANIMATION_SPEEDS = {
  off: 0,
  fast: 0.5,
  normal: 1,
  slow: 2,
} as const;
