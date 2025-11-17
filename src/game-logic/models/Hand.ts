import { Card } from './Card';

export interface HandResult {
  rank: number; // Hand type rank: 0=high card, 1=pair, 2=two pair, ..., 8=straight flush, 9=royal flush
  name: string; // Human-readable name (e.g., "Full House")
  description: string; // Detailed description (e.g., "Full House, Kings over Tens")
  cards: Card[]; // Best 5 cards
  value: number; // Numerical value for comparison (lower is better in pokersolver)
}
