/**
 * Deck implementation for Texas Hold'em
 * Standard 52-card deck with shuffle, deal, and burn operations
 */

import { type Card, createCard, RANKS, SUITS } from '../models/Card';

export class Deck {
	private cards: Card[];
	private burnedCards: Card[];

	constructor() {
		this.cards = [];
		this.burnedCards = [];
		this.initialize();
	}

	/**
	 * Initialize deck with all 52 cards
	 */
	private initialize(): void {
		this.cards = [];
		for (const suit of SUITS) {
			for (const rank of RANKS) {
				this.cards.push(createCard(rank, suit));
			}
		}
	}

	/**
	 * Fisher-Yates shuffle algorithm
	 */
	public shuffle(): void {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	/**
	 * Deal cards from the top of the deck
	 */
	public deal(count: number): Card[] {
		if (count > this.cards.length) {
			throw new Error(
				`Cannot deal ${count} cards, only ${this.cards.length} cards remaining`
			);
		}

		const dealtCards = this.cards.splice(0, count);
		return dealtCards;
	}

	/**
	 * Burn one card (per poker rules before dealing community cards)
	 */
	public burn(): Card {
		if (this.cards.length === 0) {
			throw new Error('Cannot burn card from empty deck');
		}

		const burnedCard = this.cards.shift()!;
		this.burnedCards.push(burnedCard);
		return burnedCard;
	}

	/**
	 * Reset deck to full 52 cards and shuffle
	 */
	public reset(): void {
		this.initialize();
		this.burnedCards = [];
		this.shuffle();
	}

	/**
	 * Get remaining card count
	 */
	public remainingCount(): number {
		return this.cards.length;
	}

	/**
	 * Get burned cards
	 */
	public getBurnedCards(): Card[] {
		return [...this.burnedCards];
	}

	/**
	 * Get all cards (for testing)
	 */
	public getCards(): Card[] {
		return [...this.cards];
	}
}
