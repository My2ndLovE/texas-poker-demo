/**
 * Pot calculator for main pot and side pots
 * Handles complex all-in scenarios with multiple players
 */

import type { Player } from '../models/Player';
import type { PotStructure, SidePot } from '../models/Pot';

/**
 * Calculate pot structure including side pots
 * Algorithm: Sort players by total bet, create pots for each distinct bet level
 */
export function calculatePots(players: Player[]): PotStructure {
	// Filter to players who have bet money and aren't folded
	const activePlayers = players.filter(
		(p) => p.totalBet > 0 && p.status !== 'folded' && p.status !== 'eliminated'
	);

	if (activePlayers.length === 0) {
		return {
			mainPot: 0,
			sidePots: [],
			totalPot: 0
		};
	}

	// Sort by total bet (ascending)
	const sorted = [...activePlayers].sort((a, b) => a.totalBet - b.totalBet);

	const pots: SidePot[] = [];
	let previousBet = 0;

	for (let i = 0; i < sorted.length; i++) {
		const currentBet = sorted[i].totalBet;
		const contribution = currentBet - previousBet;

		if (contribution > 0) {
			// All players from index i onwards contributed to this pot
			const eligiblePlayers = sorted.slice(i);
			const potAmount = contribution * eligiblePlayers.length;

			pots.push({
				amount: potAmount,
				eligiblePlayerIds: eligiblePlayers.map((p) => p.id)
			});
		}

		previousBet = currentBet;
	}

	// First pot is main pot, rest are side pots
	const mainPot = pots[0]?.amount || 0;
	const sidePots = pots.slice(1);
	const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);

	return {
		mainPot,
		sidePots,
		totalPot
	};
}

/**
 * Distribute pots to winners
 * Handles ties and odd chips
 */
export function distributePots(
	pot: PotStructure,
	winners: Array<{ playerId: string; potIndex: number }>,
	dealerIndex: number,
	players: Player[]
): Map<string, number> {
	const winnings = new Map<string, number>();

	// Distribute main pot
	const mainPotWinners = winners.filter((w) => w.potIndex === 0);
	if (mainPotWinners.length > 0) {
		const shareAmount = Math.floor(pot.mainPot / mainPotWinners.length);
		const remainder = pot.mainPot % mainPotWinners.length;

		mainPotWinners.forEach((winner) => {
			winnings.set(winner.playerId, (winnings.get(winner.playerId) || 0) + shareAmount);
		});

		// Give odd chips to player closest to dealer button
		if (remainder > 0) {
			const closestToDealer = findClosestToDealer(
				mainPotWinners.map((w) => w.playerId),
				dealerIndex,
				players
			);
			winnings.set(closestToDealer, (winnings.get(closestToDealer) || 0) + remainder);
		}
	}

	// Distribute side pots
	pot.sidePots.forEach((sidePot, index) => {
		const sidePotWinners = winners.filter((w) => w.potIndex === index + 1);
		if (sidePotWinners.length > 0) {
			const shareAmount = Math.floor(sidePot.amount / sidePotWinners.length);
			const remainder = sidePot.amount % sidePotWinners.length;

			sidePotWinners.forEach((winner) => {
				winnings.set(winner.playerId, (winnings.get(winner.playerId) || 0) + shareAmount);
			});

			if (remainder > 0) {
				const closestToDealer = findClosestToDealer(
					sidePotWinners.map((w) => w.playerId),
					dealerIndex,
					players
				);
				winnings.set(closestToDealer, (winnings.get(closestToDealer) || 0) + remainder);
			}
		}
	});

	return winnings;
}

/**
 * Find player closest to dealer button (clockwise)
 */
function findClosestToDealer(
	playerIds: string[],
	dealerIndex: number,
	players: Player[]
): string {
	const playersMap = new Map(players.map((p) => [p.id, p]));

	let minDistance = Infinity;
	let closest = playerIds[0];

	for (const playerId of playerIds) {
		const player = playersMap.get(playerId);
		if (!player) continue;

		// Calculate clockwise distance from dealer
		let distance = player.position - dealerIndex;
		if (distance < 0) distance += players.length;

		if (distance < minDistance) {
			minDistance = distance;
			closest = playerId;
		}
	}

	return closest;
}
