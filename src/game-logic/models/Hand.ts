import { Card } from './Card';

export interface HandResult {
  name: string; // Human-readable name (e.g., "Full House")
  description: string; // Detailed description (e.g., "Full House, Kings over Tens")
  cards: Card[]; // Best 5 cards
  value: number; // Numerical value for comparison (lower is better in pokersolver)
}
