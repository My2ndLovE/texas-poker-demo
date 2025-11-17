import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock pokersolver for tests (CommonJS/ESM interop issue)
vi.mock('pokersolver', () => {
  const mockHand = {
    solve: vi.fn((cards: string[]) => {
      if (cards.length < 2) {
        return {
          rank: 0,
          name: 'High Card',
          descr: 'High card',
          cards: [],
          cardPool: [],
          game: 'standard',
        };
      }

      // Determine rank based on card patterns
      const suits = new Map<string, number>();
      const ranks = new Map<string, number>();
      const rankValues: string[] = [];

      cards.forEach(card => {
        const rank = card.slice(0, -1);
        const suit = card.slice(-1);
        suits.set(suit, (suits.get(suit) || 0) + 1);
        ranks.set(rank, (ranks.get(rank) || 0) + 1);
        rankValues.push(rank);
      });

      const maxSuitCount = Math.max(...Array.from(suits.values()));
      const maxRankCount = Math.max(...Array.from(ranks.values()));
      const rankCounts = Array.from(ranks.values()).sort((a, b) => b - a);

      let handRank = 0;

      // Check for royal flush (A, K, Q, J, T of same suit)
      if (maxSuitCount >= 5 && cards.length >= 5) {
        const hasRoyal = rankValues.includes('A') && rankValues.includes('K') &&
                         rankValues.includes('Q') && rankValues.includes('J') &&
                         rankValues.includes('T');
        if (hasRoyal) {
          handRank = 9; // Royal flush
        } else {
          handRank = 8; // Straight flush (simplified)
        }
      } else if (maxSuitCount >= 5) {
        handRank = 5; // Flush
      } else if (maxRankCount === 4) {
        handRank = 7; // Four of a kind
      } else if (rankCounts[0] === 3 && rankCounts[1] === 2) {
        handRank = 6; // Full house
      } else if (rankCounts[0] === 3 && rankCounts[1] === 3) {
        handRank = 6; // Full house (two trips)
      } else if (maxRankCount === 3) {
        handRank = 3; // Three of a kind
      } else if (rankCounts[0] === 2 && rankCounts[1] === 2) {
        handRank = 2; // Two pair
      } else if (maxRankCount === 2) {
        handRank = 1; // Pair
      } else {
        // High card - boost if has high cards
        handRank = rankValues.includes('A') || rankValues.includes('K') ? 0.5 : 0;
      }

      return {
        rank: handRank,
        name: `Mock Hand Rank ${handRank}`,
        descr: 'Mock hand description',
        cards: [],
        cardPool: [],
        game: 'standard',
      };
    }),
    winners: vi.fn((hands: any[]) => {
      if (hands.length === 0) return [];

      // Find highest rank
      const maxRank = Math.max(...hands.map((h: any) => h.rank));
      return hands.filter((h: any) => h.rank === maxRank);
    }),
  };

  return {
    default: mockHand,
  };
});
