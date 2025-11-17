/**
 * UI store - manages UI state (modals, toasts, loading, etc.)
 */

import { writable } from 'svelte/store';

export interface WinnerData {
	playerId: string;
	playerName: string;
	amount: number;
	handDescription: string;
}

export interface Toast {
	message: string;
	type: 'info' | 'error' | 'success';
	id: string;
}

interface UIState {
	isSettingsOpen: boolean;
	isStatsOpen: boolean;
	showWinnerAnnouncement: boolean;
	winnerData: WinnerData | null;
	toasts: Toast[];
	isGameMenuOpen: boolean;
}

const initialState: UIState = {
	isSettingsOpen: false,
	isStatsOpen: false,
	showWinnerAnnouncement: false,
	winnerData: null,
	toasts: [],
	isGameMenuOpen: false
};

export const uiStore = writable<UIState>(initialState);

/**
 * Show toast notification
 */
export function showToast(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
	const toast: Toast = {
		message,
		type,
		id: Date.now().toString() + Math.random()
	};

	uiStore.update((state) => ({
		...state,
		toasts: [...state.toasts, toast]
	}));

	// Auto-dismiss after 3 seconds
	setTimeout(() => {
		dismissToast(toast.id);
	}, 3000);
}

/**
 * Dismiss specific toast
 */
export function dismissToast(id: string): void {
	uiStore.update((state) => ({
		...state,
		toasts: state.toasts.filter((t) => t.id !== id)
	}));
}

/**
 * Toggle settings modal
 */
export function toggleSettings(): void {
	uiStore.update((state) => ({
		...state,
		isSettingsOpen: !state.isSettingsOpen
	}));
}

/**
 * Toggle stats modal
 */
export function toggleStats(): void {
	uiStore.update((state) => ({
		...state,
		isStatsOpen: !state.isStatsOpen
	}));
}

/**
 * Show winner announcement
 */
export function showWinner(winner: WinnerData): void {
	uiStore.update((state) => ({
		...state,
		showWinnerAnnouncement: true,
		winnerData: winner
	}));

	// Auto-hide after 5 seconds
	setTimeout(() => {
		hideWinner();
	}, 5000);
}

/**
 * Hide winner announcement
 */
export function hideWinner(): void {
	uiStore.update((state) => ({
		...state,
		showWinnerAnnouncement: false,
		winnerData: null
	}));
}

/**
 * Toggle game menu
 */
export function toggleGameMenu(): void {
	uiStore.update((state) => ({
		...state,
		isGameMenuOpen: !state.isGameMenuOpen
	}));
}
