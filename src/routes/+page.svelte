<script lang="ts">
	import { goto } from '$app/navigation';
	import { settingsStore } from '$stores/settingsStore';
	import { startNewGame } from '$stores/gameStore';
	import { Play, Settings, Info } from 'lucide-svelte';

	function handleQuickPlay() {
		const settings = $settingsStore;
		startNewGame({
			numBots: settings.numBots,
			botDifficulty: settings.botDifficulty,
			startingChips: settings.startingChips,
			smallBlind: settings.blindLevel.small,
			bigBlind: settings.blindLevel.big
		});
		goto('/game');
	}

	function handleSettings() {
		goto('/settings');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-poker-darkGreen to-poker-green flex items-center justify-center p-4">
	<div class="text-center">
		<!-- Logo/Title -->
		<h1 class="text-6xl font-bold text-white mb-4">
			Texas Hold'em Poker
		</h1>
		<p class="text-xl text-gray-200 mb-12">
			Play against intelligent AI opponents
		</p>

		<!-- Main Menu Buttons -->
		<div class="space-y-4">
			<button
				on:click={handleQuickPlay}
				class="w-72 bg-poker-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
			>
				<Play size={28} />
				Quick Play
			</button>

			<button
				on:click={handleSettings}
				class="w-72 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
			>
				<Settings size={24} />
				Settings
			</button>

			<button
				class="w-72 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
			>
				<Info size={24} />
				How to Play
			</button>
		</div>

		<!-- Version/Credits -->
		<div class="mt-12 text-gray-300 text-sm">
			<p>Built with Svelte 5 + SvelteKit</p>
			<p class="mt-1">v0.1.0</p>
		</div>
	</div>
</div>
