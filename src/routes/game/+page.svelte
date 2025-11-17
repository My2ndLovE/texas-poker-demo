<script lang="ts">
	import { gameStore, isHumanTurn, humanPlayer } from '$stores/gameStore';
	import { goto } from '$app/navigation';
	import { Home } from 'lucide-svelte';

	// Redirect if no game in progress
	$: if (!$gameStore) {
		goto('/');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-poker-darkGreen to-poker-green p-4">
	<!-- Header -->
	<div class="flex justify-between items-center mb-4">
		<button
			on:click={() => goto('/')}
			class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
		>
			<Home size={20} />
			Leave Game
		</button>

		<div class="text-white text-lg">
			<span class="font-semibold">Hand #{$gameStore?.handNumber || 1}</span>
			<span class="mx-4">|</span>
			<span>Pot: ${$gameStore?.pot.totalPot || 0}</span>
		</div>

		<div class="text-white">
			{#if $humanPlayer}
				<div class="text-right">
					<div class="font-semibold">{$humanPlayer.name}</div>
					<div class="text-sm">Chips: ${$humanPlayer.chips}</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Game Table -->
	<div class="flex items-center justify-center h-[calc(100vh-120px)]">
		{#if $gameStore}
			<div class="bg-poker-felt rounded-full w-[900px] h-[600px] relative shadow-2xl border-8 border-gray-800">
				<!-- Community Cards -->
				<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<div class="flex gap-2">
						{#each $gameStore.communityCards as card}
							<div class="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold">
								{card.rank}{card.suit}
							</div>
						{/each}
					</div>

					<!-- Pot Display -->
					<div class="mt-4 text-center">
						<div class="bg-gray-900 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg">
							<div class="text-sm font-semibold">POT</div>
							<div class="text-2xl font-bold">${$gameStore.pot.totalPot}</div>
						</div>
					</div>
				</div>

				<!-- Players (simplified layout) -->
				{#each $gameStore.players as player, i}
					<div
						class="absolute text-white"
						style="
							left: {50 + 40 * Math.cos((i / $gameStore.players.length) * 2 * Math.PI)}%;
							top: {50 + 30 * Math.sin((i / $gameStore.players.length) * 2 * Math.PI)}%;
							transform: translate(-50%, -50%);
						"
					>
						<div class="bg-gray-900 bg-opacity-90 rounded-lg p-3 min-w-[120px]" class:ring-4={i === $gameStore.currentPlayerIndex} class:ring-yellow-400={i === $gameStore.currentPlayerIndex}>
							<div class="font-semibold text-sm">{player.name}</div>
							<div class="text-xs">${player.chips}</div>
							{#if player.bet > 0}
								<div class="text-xs text-yellow-400">Bet: ${player.bet}</div>
							{/if}
							{#if player.status === 'folded'}
								<div class="text-xs text-gray-400">Folded</div>
							{/if}
							{#if player.isDealer}
								<div class="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">D</div>
							{/if}
						</div>
					</div>
				{/each}

				<!-- Action Buttons (for human player) -->
				{#if $isHumanTurn && $humanPlayer}
					<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
						<button class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
							Fold
						</button>
						<button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
							Check
						</button>
						<button class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
							Call
						</button>
						<button class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors">
							Raise
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-white text-xl">Loading game...</div>
		{/if}
	</div>

	<!-- Game Info -->
	<div class="text-center text-white mt-4 text-sm">
		{#if $gameStore}
			<span>Phase: {$gameStore.bettingRound}</span>
			<span class="mx-4">|</span>
			<span>Current Bet: ${$gameStore.currentBet}</span>
			<span class="mx-4">|</span>
			<span>Blinds: ${$gameStore.smallBlind}/${$gameStore.bigBlind}</span>
		{/if}
	</div>
</div>
