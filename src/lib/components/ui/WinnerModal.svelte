<script lang="ts">
	import { uiStore, closeModal } from '$stores/uiStore';
	import { fade, scale } from 'svelte/transition';
	import { formatChips } from '$lib/utils/formatters';

	const modal = $derived($uiStore.activeModal);
	const isWinnerModal = $derived(modal?.type === 'winner');
	const winnerData = $derived(
		modal?.type === 'winner' ? (modal.data as { winners: string[]; amount: number }) : null
	);
</script>

{#if isWinnerModal && winnerData}
	<!-- Backdrop -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center"
		onclick={closeModal}
	></div>

	<!-- Modal -->
	<div
		transition:scale={{ start: 0.8, duration: 300 }}
		class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
	>
		<div
			class="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto relative"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Close button -->
			<button
				onclick={closeModal}
				class="absolute top-4 right-4 text-yellow-900 hover:text-yellow-950 text-2xl transition-colors"
			>
				✕
			</button>

			<!-- Trophy icon -->
			<div class="text-center mb-6">
				<div class="text-8xl mb-4 animate-bounce">🏆</div>
				<h2 class="text-4xl font-bold text-yellow-900 mb-2">
					{winnerData.winners.length > 1 ? 'Winners!' : 'Winner!'}
				</h2>
			</div>

			<!-- Winner names -->
			<div class="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
				{#each winnerData.winners as winner}
					<p class="text-2xl font-bold text-yellow-900 text-center mb-2">{winner}</p>
				{/each}
			</div>

			<!-- Amount won -->
			<div class="text-center mb-6">
				<p class="text-lg text-yellow-900 mb-1">Pot Won</p>
				<p class="text-5xl font-bold text-yellow-950">${formatChips(winnerData.amount)}</p>
			</div>

			<!-- Continue button -->
			<button
				onclick={closeModal}
				class="w-full bg-yellow-900 hover:bg-yellow-950 text-yellow-100 font-bold py-4 rounded-lg transition-colors text-xl"
			>
				Continue
			</button>

			<!-- Confetti effect (simple CSS animation) -->
			<div class="confetti-container">
				{#each Array(20) as _, i}
					<div
						class="confetti"
						style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 2}s; background-color: {['#fbbf24', '#f59e0b', '#d97706', '#b45309'][
							i % 4
						]}"
					></div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fall {
		to {
			transform: translateY(100vh) rotate(360deg);
		}
	}

	.confetti-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
		border-radius: 1rem;
	}

	.confetti {
		position: absolute;
		top: -10px;
		width: 10px;
		height: 10px;
		animation: fall 3s linear infinite;
	}
</style>
