<script lang="ts">
	import type { Player } from '$game/models/Player';
	import PlayingCard from '$components/cards/PlayingCard.svelte';
	import { formatChips } from '$lib/utils/formatters';

	interface Props {
		player: Player;
		isCurrentPlayer: boolean;
		isHuman: boolean;
	}

	let { player, isCurrentPlayer, isHuman }: Props = $props();

	const statusColor = $derived.by(() => {
		switch (player.status) {
			case 'active':
				return 'border-green-500';
			case 'all-in':
				return 'border-yellow-500';
			case 'folded':
				return 'border-gray-500';
			default:
				return 'border-gray-400';
		}
	});

	const showCards = $derived(isHuman || player.cards.length === 0);
</script>

<div class="flex flex-col items-center gap-2">
	<!-- Player info card -->
	<div
		class="bg-gray-800 rounded-lg px-4 py-2 min-w-[140px] border-2 {statusColor} {isCurrentPlayer
			? 'ring-4 ring-blue-400 ring-opacity-50'
			: ''} transition-all"
	>
		<!-- Player name and position badges -->
		<div class="flex items-center justify-between mb-1">
			<span class="font-bold text-white text-sm">{player.name}</span>
			<div class="flex gap-1">
				{#if player.isDealer}
					<span class="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">D</span>
				{/if}
				{#if player.isSmallBlind}
					<span class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">SB</span>
				{/if}
				{#if player.isBigBlind}
					<span class="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">BB</span>
				{/if}
			</div>
		</div>

		<!-- Chips -->
		<div class="text-yellow-400 font-bold text-lg">${formatChips(player.chips)}</div>

		<!-- Current bet -->
		{#if player.bet > 0}
			<div class="text-green-400 text-sm">Bet: ${formatChips(player.bet)}</div>
		{/if}

		<!-- Status -->
		{#if player.status === 'all-in'}
			<div class="text-yellow-500 text-xs font-bold uppercase">All-In</div>
		{:else if player.status === 'folded'}
			<div class="text-gray-500 text-xs font-bold uppercase">Folded</div>
		{/if}
	</div>

	<!-- Player cards -->
	{#if player.cards.length > 0}
		<div class="flex gap-1">
			{#each player.cards as card}
				<PlayingCard {card} faceDown={!showCards} small={true} />
			{/each}
		</div>
	{/if}
</div>
