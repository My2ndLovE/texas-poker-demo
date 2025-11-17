/**
 * Tests for Deck class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Deck } from '$lib/game-logic/deck/Deck';

describe('Deck', () => {
	let deck: Deck;

	beforeEach(() => {
		deck = new Deck();
	});

	describe('initialization', () => {
		it('should create a deck with 52 cards', () => {
			expect(deck.remainingCount()).toBe(52);
		});

		it('should contain all unique cards', () => {
			const cards = deck.getCards();
			const uniqueIds = new Set(cards.map((c) => c.id));
			expect(uniqueIds.size).toBe(52);
		});
	});

	describe('shuffle', () => {
		it('should change card order', () => {
			const originalOrder = deck.getCards().map((c) => c.id);
			deck.shuffle();
			const newOrder = deck.getCards().map((c) => c.id);

			// Very unlikely to be in same order after shuffle
			expect(originalOrder).not.toEqual(newOrder);
		});

		it('should maintain all 52 cards', () => {
			deck.shuffle();
			expect(deck.remainingCount()).toBe(52);
		});
	});

	describe('deal', () => {
		it('should deal requested number of cards', () => {
			const cards = deck.deal(5);
			expect(cards).toHaveLength(5);
		});

		it('should reduce deck size after dealing', () => {
			deck.deal(5);
			expect(deck.remainingCount()).toBe(47);
		});

		it('should throw error when dealing more cards than available', () => {
			expect(() => deck.deal(53)).toThrow();
		});

		it('should remove dealt cards from deck', () => {
			const dealt = deck.deal(5);
			const remaining = deck.getCards();

			dealt.forEach((dealtCard) => {
				const found = remaining.find((c) => c.id === dealtCard.id);
				expect(found).toBeUndefined();
			});
		});
	});

	describe('burn', () => {
		it('should remove one card', () => {
			const initialCount = deck.remainingCount();
			deck.burn();
			expect(deck.remainingCount()).toBe(initialCount - 1);
		});

		it('should track burned cards', () => {
			deck.burn();
			expect(deck.getBurnedCards()).toHaveLength(1);
		});

		it('should throw error when burning from empty deck', () => {
			deck.deal(52);
			expect(() => deck.burn()).toThrow();
		});
	});

	describe('reset', () => {
		it('should restore all 52 cards', () => {
			deck.deal(20);
			deck.burn();
			deck.reset();
			expect(deck.remainingCount()).toBe(52);
		});

		it('should clear burned cards', () => {
			deck.burn();
			deck.burn();
			deck.reset();
			expect(deck.getBurnedCards()).toHaveLength(0);
		});

		it('should shuffle on reset', () => {
			const originalOrder = deck.getCards().map((c) => c.id);
			deck.reset();
			const newOrder = deck.getCards().map((c) => c.id);

			// Should be shuffled (very unlikely to be same order)
			expect(originalOrder).not.toEqual(newOrder);
		});
	});
});
