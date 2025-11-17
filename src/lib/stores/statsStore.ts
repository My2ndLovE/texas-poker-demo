/**
 * Stats store - tracks session statistics
 */

import { writable, derived } from 'svelte/store';

export interface SessionStats {
	handsPlayed: number;
	handsWon: number;
	totalChipsWon: number;
	totalChipsLost: number;
	biggestPotWon: number;
	foldCount: number;
	callCount: number;
	raiseCount: number;
	allInCount: number;
}

const initialStats: SessionStats = {
	handsPlayed: 0,
	handsWon: 0,
	totalChipsWon: 0,
	totalChipsLost: 0,
	biggestPotWon: 0,
	foldCount: 0,
	callCount: 0,
	raiseCount: 0,
	allInCount: 0
};

export const statsStore = writable<SessionStats>(initialStats);

/**
 * Increment hands played
 */
export function incrementHandsPlayed(): void {
	statsStore.update((stats) => ({
		...stats,
		handsPlayed: stats.handsPlayed + 1
	}));
}

/**
 * Record hand won
 */
export function recordHandWon(potAmount: number): void {
	statsStore.update((stats) => ({
		...stats,
		handsWon: stats.handsWon + 1,
		totalChipsWon: stats.totalChipsWon + potAmount,
		biggestPotWon: Math.max(stats.biggestPotWon, potAmount)
	}));
}

/**
 * Record chips lost
 */
export function recordChipsLost(amount: number): void {
	statsStore.update((stats) => ({
		...stats,
		totalChipsLost: stats.totalChipsLost + amount
	}));
}

/**
 * Record action
 */
export function recordAction(actionType: 'fold' | 'call' | 'raise' | 'all-in'): void {
	statsStore.update((stats) => {
		const newStats = { ...stats };
		switch (actionType) {
			case 'fold':
				newStats.foldCount++;
				break;
			case 'call':
				newStats.callCount++;
				break;
			case 'raise':
				newStats.raiseCount++;
				break;
			case 'all-in':
				newStats.allInCount++;
				break;
		}
		return newStats;
	});
}

/**
 * Reset stats
 */
export function resetStats(): void {
	statsStore.set(initialStats);
}

/**
 * Derived stores for computed values
 */
export const winRate = derived(statsStore, ($stats) => {
	if ($stats.handsPlayed === 0) return 0;
	return Math.round(($stats.handsWon / $stats.handsPlayed) * 100);
});

export const netChips = derived(statsStore, ($stats) => {
	return $stats.totalChipsWon - $stats.totalChipsLost;
});
