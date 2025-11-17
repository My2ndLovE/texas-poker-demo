import { HandRank } from '@/utils/constants';
import { Card } from './Card';

export interface HandResult {
  rank: HandRank;
  description: string;
  cards: Card[];
  value: number;
}
