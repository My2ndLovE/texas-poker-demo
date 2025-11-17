/**
 * Hand Strength Evaluation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateHandStrength,
  calculatePreflopStrength,
  calculatePotOdds,
  categorizeHandRank,
} from '@/game-logic/handStrength';
import type { Card } from '@/types';

// Helper to create cards
function makeCard(rank: string, suit: string): Card {
  return {
    rank: rank as any,
    suit: suit as any,
    id: `${rank}${suit}`,
  };
}

describe('Hand Strength Calculations', () => {
  describe('calculatePreflopStrength', () => {
    it('should rate pocket aces very highly', () => {
      const holeCards: Card[] = [makeCard('A', '♠'), makeCard('A', '♥')];
      const strength = calculatePreflopStrength(holeCards);

      expect(strength).toBeGreaterThan(0.9); // Very strong hand
    });

    it('should rate pocket kings highly', () => {
      const holeCards: Card[] = [makeCard('K', '♠'), makeCard('K', '♥')];
      const strength = calculatePreflopStrength(holeCards);

      expect(strength).toBeGreaterThanOrEqual(0.8);
      expect(strength).toBeLessThan(0.95);
    });

    it('should rate suited connectors moderately', () => {
      const holeCards: Card[] = [makeCard('J', '♠'), makeCard('T', '♠')];
      const strength = calculatePreflopStrength(holeCards);

      expect(strength).toBeGreaterThan(0.4);
      expect(strength).toBeLessThan(0.7);
    });

    it('should rate weak hands low', () => {
      const holeCards: Card[] = [makeCard('7', '♣'), makeCard('2', '♦')];
      const strength = calculatePreflopStrength(holeCards);

      expect(strength).toBeLessThan(0.3);
    });

    it('should give suited cards bonus', () => {
      const suited: Card[] = [makeCard('K', '♠'), makeCard('Q', '♠')];
      const unsuited: Card[] = [makeCard('K', '♠'), makeCard('Q', '♥')];

      const suitedStrength = calculatePreflopStrength(suited);
      const unsuitedStrength = calculatePreflopStrength(unsuited);

      expect(suitedStrength).toBeGreaterThan(unsuitedStrength);
    });

    it('should give connected cards bonus', () => {
      const connected: Card[] = [makeCard('9', '♠'), makeCard('8', '♥')];
      const gapped: Card[] = [makeCard('9', '♠'), makeCard('5', '♥')];

      const connectedStrength = calculatePreflopStrength(connected);
      const gappedStrength = calculatePreflopStrength(gapped);

      expect(connectedStrength).toBeGreaterThan(gappedStrength);
    });

    it('should handle empty array gracefully', () => {
      const strength = calculatePreflopStrength([]);
      expect(strength).toBe(0);
    });
  });

  describe('calculateHandStrength', () => {
    it('should evaluate royal flush as maximum strength', () => {
      const holeCards: Card[] = [makeCard('A', '♠'), makeCard('K', '♠')];
      const communityCards: Card[] = [
        makeCard('Q', '♠'),
        makeCard('J', '♠'),
        makeCard('T', '♠'),
        makeCard('2', '♥'),
        makeCard('3', '♦'),
      ];

      const strength = calculateHandStrength(holeCards, communityCards);
      expect(strength).toBe(1); // Royal flush = rank 9 / 9 = 1
    });

    it('should evaluate four of a kind highly', () => {
      const holeCards: Card[] = [makeCard('A', '♠'), makeCard('A', '♥')];
      const communityCards: Card[] = [
        makeCard('A', '♦'),
        makeCard('A', '♣'),
        makeCard('K', '♠'),
      ];

      const strength = calculateHandStrength(holeCards, communityCards);
      expect(strength).toBeGreaterThan(0.75); // Four of a kind = rank 7 / 9 = 0.777...
    });

    it('should evaluate pair lower than flush', () => {
      const pairCards: Card[] = [makeCard('A', '♠'), makeCard('A', '♥')];
      const flushHole: Card[] = [makeCard('A', '♠'), makeCard('K', '♠')];

      const pairCommunity: Card[] = [
        makeCard('2', '♦'),
        makeCard('7', '♣'),
        makeCard('9', '♥'),
      ];

      const flushCommunity: Card[] = [
        makeCard('Q', '♠'),
        makeCard('J', '♠'),
        makeCard('T', '♠'),
      ];

      const pairStrength = calculateHandStrength(pairCards, pairCommunity);
      const flushStrength = calculateHandStrength(flushHole, flushCommunity);

      expect(flushStrength).toBeGreaterThan(pairStrength);
    });

    it('should handle empty community cards', () => {
      const holeCards: Card[] = [makeCard('A', '♠'), makeCard('K', '♥')];
      const strength = calculateHandStrength(holeCards, []);

      expect(strength).toBeGreaterThan(0);
      expect(strength).toBeLessThan(1);
    });
  });

  describe('calculatePotOdds', () => {
    it('should calculate correct pot odds', () => {
      const potSize = 100;
      const betToCall = 50;

      const potOdds = calculatePotOdds(potSize, betToCall);

      // Pot odds = 100 / (100 + 50) = 0.666...
      expect(potOdds).toBeCloseTo(0.667, 2);
    });

    it('should handle zero bet (free call)', () => {
      const potOdds = calculatePotOdds(100, 0);
      expect(potOdds).toBe(1); // Free call = 100% pot odds
    });

    it('should handle large bet relative to pot', () => {
      const potOdds = calculatePotOdds(100, 500);
      expect(potOdds).toBeCloseTo(0.167, 2); // Bad pot odds
    });
  });

  describe('categorizeHandRank', () => {
    it('should categorize royal flush as premium', () => {
      expect(categorizeHandRank(9)).toBe('premium');
    });

    it('should categorize straight flush as premium', () => {
      expect(categorizeHandRank(8)).toBe('premium');
    });

    it('should categorize four of a kind as premium', () => {
      expect(categorizeHandRank(7)).toBe('premium');
    });

    it('should categorize full house as strong', () => {
      expect(categorizeHandRank(6)).toBe('strong');
    });

    it('should categorize flush as strong', () => {
      expect(categorizeHandRank(5)).toBe('strong');
    });

    it('should categorize straight as medium', () => {
      expect(categorizeHandRank(4)).toBe('medium');
    });

    it('should categorize three of a kind as medium', () => {
      expect(categorizeHandRank(3)).toBe('medium');
    });

    it('should categorize two pair as weak', () => {
      expect(categorizeHandRank(2)).toBe('weak');
    });

    it('should categorize pair as weak', () => {
      expect(categorizeHandRank(1)).toBe('weak');
    });

    it('should categorize high card as weak', () => {
      expect(categorizeHandRank(0)).toBe('weak');
    });
  });
});
