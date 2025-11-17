import { Rank, Suit, RANK_VALUES } from '@/utils/constants';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const createCard = (rank: Rank, suit: Suit): Card => ({ rank, suit });

export const cardToString = (card: Card): string => `${card.rank}${card.suit}`;

export const stringToCard = (str: string): Card => {
  if (str.length !== 2) {
    throw new Error(`Invalid card string: ${str}`);
  }
  const rank = str[0] as Rank;
  const suit = str[1] as Suit;
  return { rank, suit };
};

export const compareCards = (a: Card, b: Card): number => {
  return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
};

export const cardsEqual = (a: Card, b: Card): boolean => {
  return a.rank === b.rank && a.suit === b.suit;
};
