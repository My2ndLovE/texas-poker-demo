/**
 * Card model for Texas Hold'em poker
 * Represents a single playing card with rank and suit
 */

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades

export interface Card {
	rank: Rank;
	suit: Suit;
	id: string; // Unique identifier for React key
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['h', 'd', 'c', 's'];

/**
 * Create a new card
 */
export function createCard(rank: Rank, suit: Suit): Card {
	return {
		rank,
		suit,
		id: `${rank}${suit}`
	};
}

/**
 * Convert card to string notation (e.g., "Ah", "Kd")
 */
export function cardToString(card: Card): string {
	return `${card.rank}${card.suit}`;
}

/**
 * Convert string notation to card object
 */
export function stringToCard(str: string): Card {
	if (str.length !== 2) {
		throw new Error(`Invalid card string: ${str}`);
	}

	const rank = str[0] as Rank;
	const suit = str[1] as Suit;

	if (!RANKS.includes(rank)) {
		throw new Error(`Invalid rank: ${rank}`);
	}

	if (!SUITS.includes(suit)) {
		throw new Error(`Invalid suit: ${suit}`);
	}

	return createCard(rank, suit);
}

/**
 * Get display name for suit (with Unicode symbols)
 */
export function getSuitSymbol(suit: Suit): string {
	const symbols: Record<Suit, string> = {
		h: '♥',
		d: '♦',
		c: '♣',
		s: '♠'
	};
	return symbols[suit];
}

/**
 * Get suit color
 */
export function getSuitColor(suit: Suit): 'red' | 'black' {
	return suit === 'h' || suit === 'd' ? 'red' : 'black';
}

/**
 * Get display name for rank
 */
export function getRankDisplay(rank: Rank): string {
	const displays: Record<Rank, string> = {
		'2': '2',
		'3': '3',
		'4': '4',
		'5': '5',
		'6': '6',
		'7': '7',
		'8': '8',
		'9': '9',
		T: '10',
		J: 'Jack',
		Q: 'Queen',
		K: 'King',
		A: 'Ace'
	};
	return displays[rank];
}

/**
 * Compare cards for equality
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
	return card1.rank === card2.rank && card1.suit === card2.suit;
}
