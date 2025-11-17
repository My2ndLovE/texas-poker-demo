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

<div
	class="min-h-screen bg-gradient-to-br from-poker-darkGreen to-poker-green flex items-center justify-center p-4 relative overflow-hidden"
>
	<!-- Decorative background elements -->
	<div class="absolute inset-0 overflow-hidden opacity-10">
		<div class="absolute top-10 left-10 text-9xl text-white">♠</div>
		<div class="absolute top-20 right-20 text-9xl text-white">♥</div>
		<div class="absolute bottom-20 left-20 text-9xl text-white">♣</div>
		<div class="absolute bottom-10 right-10 text-9xl text-white">♦</div>
	</div>

	<div class="text-center relative z-10 max-w-2xl">
		<!-- Logo/Title with cards -->
		<div class="mb-8">
			<div class="flex justify-center gap-4 mb-6">
				<!-- Decorative playing cards -->
				<div
					class="w-16 h-24 bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center text-3xl font-bold text-red-600 transform -rotate-12 hover:rotate-0 transition-transform"
				>
					<span>A</span>
					<span>♥</span>
				</div>
				<div
					class="w-16 h-24 bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center text-3xl font-bold text-black transform rotate-6 hover:rotate-0 transition-transform"
				>
					<span>K</span>
					<span>♠</span>
				</div>
			</div>

			<h1 class="text-7xl font-bold text-white mb-4 drop-shadow-2xl">Texas Hold'em</h1>
			<p class="text-2xl text-yellow-400 font-semibold mb-2">Poker</p>
			<p class="text-xl text-gray-200">Play against intelligent AI opponents</p>
		</div>

		<!-- Current Settings Preview -->
		<div class="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4 mb-8 shadow-xl">
			<div class="grid grid-cols-3 gap-4 text-white">
				<div>
					<div class="text-gray-300 text-sm">Opponents</div>
					<div class="font-bold text-lg">{$settingsStore.numBots} Bots</div>
				</div>
				<div>
					<div class="text-gray-300 text-sm">Starting Chips</div>
					<div class="font-bold text-lg">${$settingsStore.startingChips}</div>
				</div>
				<div>
					<div class="text-gray-300 text-sm">Blinds</div>
					<div class="font-bold text-lg">
						${$settingsStore.blindLevel.small}/${$settingsStore.blindLevel.big}
					</div>
				</div>
			</div>
		</div>

		<!-- Main Menu Buttons -->
		<div class="space-y-4">
			<button
				onclick={handleQuickPlay}
				class="w-80 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-bold py-5 px-8 rounded-xl text-2xl flex items-center justify-center gap-3 transition-all shadow-2xl transform hover:scale-105 hover:shadow-yellow-500/50"
			>
				<Play size={32} />
				Quick Play
			</button>

			<button
				onclick={handleSettings}
				class="w-80 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-3 transition-all shadow-xl transform hover:scale-105"
			>
				<Settings size={24} />
				Settings
			</button>

			<button
				class="w-80 bg-gray-800 bg-opacity-80 hover:bg-opacity-90 text-white font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-3 transition-all shadow-xl transform hover:scale-105"
			>
				<Info size={24} />
				How to Play
			</button>
		</div>

		<!-- Feature highlights -->
		<div class="mt-12 grid grid-cols-3 gap-6 text-white">
			<div class="bg-black bg-opacity-20 rounded-lg p-4">
				<div class="text-3xl mb-2">🎮</div>
				<div class="font-semibold">Smart AI</div>
				<div class="text-sm text-gray-300">3 difficulty levels</div>
			</div>
			<div class="bg-black bg-opacity-20 rounded-lg p-4">
				<div class="text-3xl mb-2">⚡</div>
				<div class="font-semibold">Fast & Smooth</div>
				<div class="text-sm text-gray-300">Built with Svelte 5</div>
			</div>
			<div class="bg-black bg-opacity-20 rounded-lg p-4">
				<div class="text-3xl mb-2">🎯</div>
				<div class="font-semibold">Realistic</div>
				<div class="text-sm text-gray-300">True poker rules</div>
			</div>
		</div>

		<!-- Version/Credits -->
		<div class="mt-12 text-gray-300 text-sm">
			<p>Built with Svelte 5 + SvelteKit + TypeScript</p>
			<p class="mt-1">v0.1.0 Beta</p>
		</div>
	</div>
</div>
