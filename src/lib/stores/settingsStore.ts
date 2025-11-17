/**
 * Settings store - persists user settings to localStorage
 * Uses Svelte stores with custom persistence logic
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
	numBots: number;
	botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
	startingChips: number;
	blindLevel: {
		small: number;
		big: number;
	};
	actionTimer: number; // seconds (0 = off)
	animationSpeed: 'off' | 'fast' | 'normal' | 'slow';
	soundEffects: boolean;
	cardBackDesign: string;
	language: 'en';
}

const defaultSettings: Settings = {
	numBots: 5,
	botDifficulty: 'mixed',
	startingChips: 1000,
	blindLevel: {
		small: 10,
		big: 20
	},
	actionTimer: 30,
	animationSpeed: 'normal',
	soundEffects: true,
	cardBackDesign: 'blue',
	language: 'en'
};

// Load from localStorage or use defaults
const storedSettings = browser
	? JSON.parse(localStorage.getItem('texas-poker-settings') || JSON.stringify(defaultSettings))
	: defaultSettings;

/**
 * Create settings store with localStorage persistence
 */
function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(storedSettings);

	return {
		subscribe,
		set: (value: Settings) => {
			if (browser) {
				localStorage.setItem('texas-poker-settings', JSON.stringify(value));
			}
			set(value);
		},
		update: (fn: (value: Settings) => Settings) => {
			update((current) => {
				const updated = fn(current);
				if (browser) {
					localStorage.setItem('texas-poker-settings', JSON.stringify(updated));
				}
				return updated;
			});
		},
		reset: () => {
			if (browser) {
				localStorage.removeItem('texas-poker-settings');
			}
			set(defaultSettings);
		}
	};
}

export const settingsStore = createSettingsStore();

/**
 * Update a specific setting
 */
export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
	settingsStore.update((settings) => ({
		...settings,
		[key]: value
	}));
}
