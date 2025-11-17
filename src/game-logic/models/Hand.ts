import { Card } from './Card';
import { HandRank } from '@/utils/constants';

export interface HandResult {
  rank: number; // HandRank value (0-9)
  name: string; // Human-readable name (e.g., "Full House")
  description: string; // Detailed description (e.g., "Full House, Kings over Tens")
  cards: Card[]; // Best 5 cards
  value: number; // Numerical value for comparison (lower is better in pokersolver)
}
