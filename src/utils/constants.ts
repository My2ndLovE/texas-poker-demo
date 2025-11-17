// Hand ranks
export const HandRank = {
  HighCard: 0,
  Pair: 1,
  TwoPair: 2,
  ThreeOfAKind: 3,
  Straight: 4,
  Flush: 5,
  FullHouse: 6,
  FourOfAKind: 7,
  StraightFlush: 8,
  RoyalFlush: 9,
} as const;

export type HandRank = (typeof HandRank)[keyof typeof HandRank];

// Action types
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

// Game phases
export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

// Blind level presets
export const BLIND_LEVELS = {
  MICRO: { small: 5, big: 10 },
  LOW: { small: 10, big: 20 },
  MEDIUM: { small: 25, big: 50 },
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  numBots: 5,
  botDifficulty: 'mixed' as const,
  startingChips: 1000,
  blindLevel: BLIND_LEVELS.LOW,
  actionTimer: 30, // seconds
  animationSpeed: 'normal' as const,
  soundEffects: true,
  cardBackDesign: 'blue',
};

// Touch target minimum sizes (mobile)
export const TOUCH_TARGET = {
  IOS_MIN: 44, // 44x44px
  ANDROID_MIN: 48, // 48x48px
} as const;
