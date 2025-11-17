/**
 * Formatting utilities
 */

/**
 * Format chips amount with commas
 */
export function formatChips(amount: number): string {
	return amount.toLocaleString('en-US');
}

/**
 * Format pot display
 */
export function formatPot(amount: number): string {
	return `$${formatChips(amount)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
	return `${Math.round(value)}%`;
}

/**
 * Format time (seconds to MM:SS)
 */
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get action color class for UI
 */
export function getActionColorClass(actionType: string): string {
	switch (actionType) {
		case 'fold':
			return 'text-red-500';
		case 'check':
			return 'text-gray-500';
		case 'call':
			return 'text-blue-500';
		case 'bet':
		case 'raise':
			return 'text-green-500';
		case 'all-in':
			return 'text-yellow-500';
		default:
			return 'text-gray-500';
	}
}

/**
 * Format card display (for accessibility)
 */
export function formatCardForScreenReader(rank: string, suit: string): string {
	const rankNames: Record<string, string> = {
		'2': 'Two',
		'3': 'Three',
		'4': 'Four',
		'5': 'Five',
		'6': 'Six',
		'7': 'Seven',
		'8': 'Eight',
		'9': 'Nine',
		T: 'Ten',
		J: 'Jack',
		Q: 'Queen',
		K: 'King',
		A: 'Ace'
	};

	const suitNames: Record<string, string> = {
		h: 'Hearts',
		d: 'Diamonds',
		c: 'Clubs',
		s: 'Spades'
	};

	return `${rankNames[rank]} of ${suitNames[suit]}`;
}
