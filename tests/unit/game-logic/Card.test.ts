/**
 * Tests for Card model
 */

import { describe, it, expect } from 'vitest';
import {
	createCard,
	cardToString,
	stringToCard,
	getSuitSymbol,
	getSuitColor,
	cardsEqual,
	type Card
} from '$lib/game-logic/models/Card';

describe('Card', () => {
	describe('createCard', () => {
		it('should create a card with rank and suit', () => {
			const card = createCard('A', 'h');
			expect(card.rank).toBe('A');
			expect(card.suit).toBe('h');
			expect(card.id).toBe('Ah');
		});
	});

	describe('cardToString', () => {
		it('should convert card to string notation', () => {
			const card = createCard('K', 'd');
			expect(cardToString(card)).toBe('Kd');
		});
	});

	describe('stringToCard', () => {
		it('should convert string to card', () => {
			const card = stringToCard('Qs');
			expect(card.rank).toBe('Q');
			expect(card.suit).toBe('s');
		});

		it('should throw error for invalid string', () => {
			expect(() => stringToCard('X')).toThrow();
			expect(() => stringToCard('ABC')).toThrow();
		});

		it('should throw error for invalid rank', () => {
			expect(() => stringToCard('Xh')).toThrow('Invalid rank');
		});

		it('should throw error for invalid suit', () => {
			expect(() => stringToCard('Ax')).toThrow('Invalid suit');
		});
	});

	describe('getSuitSymbol', () => {
		it('should return correct Unicode symbol for hearts', () => {
			expect(getSuitSymbol('h')).toBe('♥');
		});

		it('should return correct Unicode symbol for diamonds', () => {
			expect(getSuitSymbol('d')).toBe('♦');
		});

		it('should return correct Unicode symbol for clubs', () => {
			expect(getSuitSymbol('c')).toBe('♣');
		});

		it('should return correct Unicode symbol for spades', () => {
			expect(getSuitSymbol('s')).toBe('♠');
		});
	});

	describe('getSuitColor', () => {
		it('should return red for hearts', () => {
			expect(getSuitColor('h')).toBe('red');
		});

		it('should return red for diamonds', () => {
			expect(getSuitColor('d')).toBe('red');
		});

		it('should return black for clubs', () => {
			expect(getSuitColor('c')).toBe('black');
		});

		it('should return black for spades', () => {
			expect(getSuitColor('s')).toBe('black');
		});
	});

	describe('cardsEqual', () => {
		it('should return true for equal cards', () => {
			const card1 = createCard('A', 'h');
			const card2 = createCard('A', 'h');
			expect(cardsEqual(card1, card2)).toBe(true);
		});

		it('should return false for different ranks', () => {
			const card1 = createCard('A', 'h');
			const card2 = createCard('K', 'h');
			expect(cardsEqual(card1, card2)).toBe(false);
		});

		it('should return false for different suits', () => {
			const card1 = createCard('A', 'h');
			const card2 = createCard('A', 'd');
			expect(cardsEqual(card1, card2)).toBe(false);
		});
	});
});
