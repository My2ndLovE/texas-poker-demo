/**
 * Hand evaluator using pokersolver library
 * Wrapper for evaluating poker hands and comparing them
 */

import { Hand } from 'pokersolver';
import type { Card } from '../models/Card';
import type { HandResult, HandRank } from '../models/Hand';
import { cardToString } from '../models/Card';

/**
 * Evaluate a poker hand from 5-7 cards
 */
export function evaluateHand(cards: Card[]): HandResult {
	if (cards.length < 5 || cards.length > 7) {
		throw new Error('Hand evaluation requires 5-7 cards');
	}

	// Convert cards to pokersolver format
	const cardStrings = cards.map(cardToString);

	// Solve hand using pokersolver
	const solvedHand = Hand.solve(cardStrings);

	return {
		rank: mapPokerSolverRankToHandRank(solvedHand.rank),
		value: solvedHand.rank,
		description: solvedHand.descr,
		cards: cards.slice(0, 5) // Best 5 cards
	};
}

/**
 * Compare two hands and return winner
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
	const h1Strings = hand1Cards.map(cardToString);
	const h2Strings = hand2Cards.map(cardToString);

	const h1 = Hand.solve(h1Strings);
	const h2 = Hand.solve(h2Strings);

	const winners = Hand.winners([h1, h2]);

	if (winners.length === 2) return 0; // Tie
	return winners[0] === h1 ? 1 : -1;
}

/**
 * Find winners among multiple hands
 */
export function findWinners(playerHands: Array<{ playerId: string; cards: Card[] }>): string[] {
	if (playerHands.length === 0) return [];
	if (playerHands.length === 1) return [playerHands[0].playerId];

	const hands = playerHands.map((ph) => ({
		playerId: ph.playerId,
		hand: Hand.solve(ph.cards.map(cardToString))
	}));

	const solvedHands = hands.map((h) => h.hand);
	const winners = Hand.winners(solvedHands);

	return hands.filter((h) => winners.includes(h.hand)).map((h) => h.playerId);
}

/**
 * Map pokersolver rank to our HandRank enum
 */
function mapPokerSolverRankToHandRank(rank: number): HandRank {
	// pokersolver ranks: 0-9 (0=high card, 9=straight flush)
	const mapping: HandRank[] = [
		'high-card',
		'pair',
		'two-pair',
		'three-of-a-kind',
		'straight',
		'flush',
		'full-house',
		'four-of-a-kind',
		'straight-flush',
		'royal-flush'
	];

	return mapping[rank] || 'high-card';
}
