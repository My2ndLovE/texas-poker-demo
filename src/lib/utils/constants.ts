/**
 * Game constants
 */

export const BLIND_PRESETS = [
	{ small: 5, big: 10, label: '$5/$10' },
	{ small: 10, big: 20, label: '$10/$20' },
	{ small: 25, big: 50, label: '$25/$50' },
	{ small: 50, big: 100, label: '$50/$100' },
	{ small: 100, big: 200, label: '$100/$200' }
];

export const STARTING_CHIPS_PRESETS = [500, 1000, 2000, 5000, 10000];

export const ACTION_TIMER_OPTIONS = [
	{ value: 0, label: 'Off' },
	{ value: 15, label: '15 seconds' },
	{ value: 30, label: '30 seconds' },
	{ value: 60, label: '60 seconds' }
];

export const ANIMATION_SPEEDS = {
	off: 0,
	fast: 0.5,
	normal: 1,
	slow: 1.5
} as const;

export const BOT_NAMES = [
	'Alice',
	'Bob',
	'Charlie',
	'Diana',
	'Eve',
	'Frank',
	'Grace',
	'Henry',
	'Ivy',
	'Jack',
	'Kate',
	'Leo',
	'Maya',
	'Noah',
	'Olivia'
];

export const HAND_RANK_DESCRIPTIONS = {
	'royal-flush': 'Royal Flush',
	'straight-flush': 'Straight Flush',
	'four-of-a-kind': 'Four of a Kind',
	'full-house': 'Full House',
	flush: 'Flush',
	straight: 'Straight',
	'three-of-a-kind': 'Three of a Kind',
	'two-pair': 'Two Pair',
	pair: 'Pair',
	'high-card': 'High Card'
};
