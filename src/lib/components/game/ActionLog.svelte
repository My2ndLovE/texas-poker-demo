<script lang="ts">
	import { gameStore } from '$stores/gameStore';
	import { getActionColorClass } from '$lib/utils/formatters';

	const recentActions = $derived($gameStore?.actionHistory.slice(-10).reverse() || []);

	function formatAction(action: any): string {
		const player = $gameStore?.players.find((p) => p.id === action.playerId);
		const playerName = player?.name || 'Unknown';

		switch (action.type) {
			case 'fold':
				return `${playerName} folded`;
			case 'check':
				return `${playerName} checked`;
			case 'call':
				return `${playerName} called $${action.amount}`;
			case 'bet':
				return `${playerName} bet $${action.amount}`;
			case 'raise':
				return `${playerName} raised to $${action.amount}`;
			case 'all-in':
				return `${playerName} went all-in for $${action.amount}`;
			case 'small-blind':
				return `${playerName} posted small blind $${action.amount}`;
			case 'big-blind':
				return `${playerName} posted big blind $${action.amount}`;
			default:
				return `${playerName} performed ${action.type}`;
		}
	}
</script>

<div class="bg-gray-800 rounded-lg shadow-lg p-4 h-full flex flex-col">
	<h3 class="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">Action Log</h3>

	<div class="flex-1 overflow-y-auto space-y-2">
		{#if recentActions.length === 0}
			<p class="text-gray-500 text-sm italic">No actions yet...</p>
		{:else}
			{#each recentActions as action, i (action.timestamp || i)}
				<div class="text-sm py-1 px-2 bg-gray-700 rounded">
					<span class={getActionColorClass(action.type)}>{formatAction(action)}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
