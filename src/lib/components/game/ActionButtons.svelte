<script lang="ts">
	import { applyPlayerAction, gameStore, humanPlayer, isHumanTurn } from '$stores/gameStore';
	import { getValidActions, getCallAmount, getMinRaise } from '$game/rules/BettingRules';
	import type { ActionType } from '$game/models/Action';

	interface Props {
		onRaiseClick?: () => void;
	}

	let { onRaiseClick }: Props = $props();

	let showRaiseSlider = $state(false);
	let raiseAmount = $state(0);

	const validActions = $derived<ActionType[]>(
		$gameStore && $humanPlayer ? getValidActions($gameStore, $humanPlayer.id) : []
	);

	const callAmount = $derived(
		$gameStore && $humanPlayer ? getCallAmount($gameStore, $humanPlayer.id) : 0
	);

	const minRaise = $derived(
		$gameStore && $humanPlayer ? getMinRaise($gameStore, $humanPlayer.id) : 0
	);

	const maxRaise = $derived($humanPlayer?.chips || 0);

	function handleFold() {
		if (!$humanPlayer) return;
		applyPlayerAction({ type: 'fold', playerId: $humanPlayer.id, amount: 0 });
	}

	function handleCheck() {
		if (!$humanPlayer) return;
		applyPlayerAction({ type: 'check', playerId: $humanPlayer.id, amount: 0 });
	}

	function handleCall() {
		if (!$humanPlayer) return;
		const amount = Math.min(callAmount, $humanPlayer.chips);
		applyPlayerAction({ type: 'call', playerId: $humanPlayer.id, amount });
	}

	function handleBet() {
		if (!$humanPlayer) return;
		showRaiseSlider = true;
		raiseAmount = minRaise;
		onRaiseClick?.();
	}

	function handleRaise() {
		if (!$humanPlayer) return;
		showRaiseSlider = true;
		raiseAmount = minRaise;
		onRaiseClick?.();
	}

	function handleAllIn() {
		if (!$humanPlayer) return;
		applyPlayerAction({ type: 'all-in', playerId: $humanPlayer.id, amount: $humanPlayer.chips });
	}

	function confirmRaise() {
		if (!$humanPlayer) return;
		const actionType = $gameStore?.currentBet === 0 ? 'bet' : 'raise';
		applyPlayerAction({ type: actionType, playerId: $humanPlayer.id, amount: raiseAmount });
		showRaiseSlider = false;
	}

	function cancelRaise() {
		showRaiseSlider = false;
	}

	$effect(() => {
		if (showRaiseSlider) {
			raiseAmount = minRaise;
		}
	});
</script>

{#if $isHumanTurn && $humanPlayer}
	<div class="flex flex-col gap-4 bg-gray-800 p-4 rounded-lg shadow-xl">
		{#if !showRaiseSlider}
			<div class="flex gap-2 flex-wrap">
				{#if validActions.includes('fold')}
					<button
						onclick={handleFold}
						class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
					>
						Fold
					</button>
				{/if}

				{#if validActions.includes('check')}
					<button
						onclick={handleCheck}
						class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
					>
						Check
					</button>
				{/if}

				{#if validActions.includes('call')}
					<button
						onclick={handleCall}
						class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
					>
						Call ${callAmount}
					</button>
				{/if}

				{#if validActions.includes('bet')}
					<button
						onclick={handleBet}
						class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
					>
						Bet
					</button>
				{/if}

				{#if validActions.includes('raise')}
					<button
						onclick={handleRaise}
						class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
					>
						Raise
					</button>
				{/if}

				{#if validActions.includes('all-in')}
					<button
						onclick={handleAllIn}
						class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
					>
						All-In (${$humanPlayer.chips})
					</button>
				{/if}
			</div>
		{:else}
			<!-- Raise Slider -->
			<div class="flex flex-col gap-3">
				<div class="flex justify-between items-center">
					<span class="text-white font-semibold">Raise Amount: ${raiseAmount}</span>
					<button
						onclick={cancelRaise}
						class="text-gray-400 hover:text-white transition-colors"
					>
						✕
					</button>
				</div>

				<input
					type="range"
					bind:value={raiseAmount}
					min={minRaise}
					max={maxRaise}
					step={Math.max(1, Math.floor(($gameStore?.smallBlind || 10) / 2))}
					class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
				/>

				<div class="flex justify-between text-sm text-gray-400">
					<span>Min: ${minRaise}</span>
					<span>Max: ${maxRaise}</span>
				</div>

				<div class="flex gap-2">
					<button
						onclick={confirmRaise}
						class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
					>
						Confirm ${raiseAmount}
					</button>
					<button
						onclick={cancelRaise}
						class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="bg-gray-800 p-4 rounded-lg shadow-xl">
		<p class="text-gray-400 text-center">Waiting for other players...</p>
	</div>
{/if}

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		background: #10b981;
		cursor: pointer;
		border-radius: 50%;
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: #10b981;
		cursor: pointer;
		border-radius: 50%;
		border: none;
	}
</style>
