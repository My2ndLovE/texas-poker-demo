<script lang="ts">
	import { gameStore, isHumanTurn, humanPlayer } from '$stores/gameStore';
	import { goto } from '$app/navigation';
	import { Home } from 'lucide-svelte';
	import PlayingCard from '$components/cards/PlayingCard.svelte';
	import PlayerPosition from '$components/game/PlayerPosition.svelte';
	import ActionButtons from '$components/game/ActionButtons.svelte';
	import ActionLog from '$components/game/ActionLog.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import WinnerModal from '$components/ui/WinnerModal.svelte';
	import { formatChips } from '$lib/utils/formatters';

	// Redirect if no game in progress
	$: if (!$gameStore) {
		goto('/');
	}

	// Calculate player positions for circular layout
	function getPlayerPosition(index: number, total: number) {
		const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
		const radiusX = 42; // Horizontal radius percentage
		const radiusY = 35; // Vertical radius percentage
		return {
			left: `${50 + radiusX * Math.cos(angle)}%`,
			top: `${50 + radiusY * Math.sin(angle)}%`
		};
	}
</script>

<!-- Toast Notifications -->
<Toast />

<!-- Winner Modal -->
<WinnerModal />

<div class="min-h-screen bg-gradient-to-br from-poker-darkGreen to-poker-green p-4">
	{#if $gameStore}
		<div class="flex gap-4 h-screen">
			<!-- Main Game Area -->
			<div class="flex-1 flex flex-col">
				<!-- Header -->
				<div class="flex justify-between items-center mb-4">
					<button
						onclick={() => goto('/')}
						class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg"
					>
						<Home size={20} />
						Leave Game
					</button>

					<div class="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
						<div class="flex gap-6 items-center">
							<div>
								<span class="text-gray-400 text-sm">Hand</span>
								<span class="ml-2 font-bold text-xl">#{$gameStore.handNumber}</span>
							</div>
							<div class="w-px h-8 bg-gray-600"></div>
							<div>
								<span class="text-gray-400 text-sm">Blinds</span>
								<span class="ml-2 font-bold text-lg"
									>${$gameStore.smallBlind}/${$gameStore.bigBlind}</span
								>
							</div>
							<div class="w-px h-8 bg-gray-600"></div>
							<div>
								<span class="text-gray-400 text-sm">Phase</span>
								<span class="ml-2 font-bold text-lg capitalize">{$gameStore.bettingRound}</span>
							</div>
						</div>
					</div>

					<div class="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg min-w-[150px]">
						{#if $humanPlayer}
							<div class="text-sm text-gray-400">Your Chips</div>
							<div class="text-2xl font-bold text-yellow-400">
								${formatChips($humanPlayer.chips)}
							</div>
						{/if}
					</div>
				</div>

				<!-- Poker Table -->
				<div class="flex-1 flex items-center justify-center">
					<div
						class="bg-poker-felt rounded-[50%] w-[900px] h-[600px] relative shadow-2xl border-8 border-amber-900"
						style="box-shadow: inset 0 0 50px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.3);"
					>
						<!-- Table Center - Community Cards -->
						<div
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4"
						>
							<!-- Community Cards -->
							<div class="flex gap-2">
								{#if $gameStore.communityCards.length > 0}
									{#each $gameStore.communityCards as card}
										<PlayingCard {card} />
									{/each}
								{:else}
									<!-- Placeholder for no community cards yet -->
									<div class="text-white text-opacity-30 text-sm italic">Preflop</div>
								{/if}
							</div>

							<!-- Pot Display -->
							<div class="bg-gradient-to-br from-yellow-600 to-yellow-700 px-8 py-4 rounded-lg shadow-xl border-2 border-yellow-500">
								<div class="text-yellow-200 text-xs font-semibold uppercase tracking-wider">
									Pot
								</div>
								<div class="text-white text-3xl font-bold">
									${formatChips($gameStore.pot.totalPot)}
								</div>
								{#if $gameStore.currentBet > 0}
									<div class="text-yellow-200 text-xs mt-1">
										Current Bet: ${formatChips($gameStore.currentBet)}
									</div>
								{/if}
							</div>
						</div>

						<!-- Players in circular positions -->
						{#each $gameStore.players as player, i}
							{@const pos = getPlayerPosition(i, $gameStore.players.length)}
							<div
								class="absolute transform -translate-x-1/2 -translate-y-1/2"
								style="left: {pos.left}; top: {pos.top};"
							>
								<PlayerPosition
									{player}
									isCurrentPlayer={i === $gameStore.currentPlayerIndex}
									isHuman={player.id === $humanPlayer?.id}
								/>
							</div>
						{/each}
					</div>
				</div>

				<!-- Action Buttons Area -->
				<div class="mt-4">
					<ActionButtons />
				</div>
			</div>

			<!-- Sidebar - Action Log -->
			<div class="w-80">
				<ActionLog />
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-screen">
			<div class="text-white text-2xl">Loading game...</div>
		</div>
	{/if}
</div>
