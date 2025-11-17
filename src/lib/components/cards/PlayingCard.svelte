<script lang="ts">
	import { getSuitSymbol, getSuitColor, type Card } from '$game/models/Card';

	interface Props {
		card?: Card;
		faceDown?: boolean;
		small?: boolean;
		large?: boolean;
	}

	let { card, faceDown = false, small = false, large = false }: Props = $props();

	const sizeClasses = $derived(
		large ? 'w-24 h-36 text-3xl' : small ? 'w-12 h-18 text-sm' : 'w-16 h-24 text-xl'
	);

	const suitColor = $derived(card ? getSuitColor(card.suit) : 'black');
	const suitSymbol = $derived(card ? getSuitSymbol(card.suit) : '');
</script>

{#if faceDown}
	<!-- Card Back -->
	<div
		class="relative {sizeClasses} rounded-lg border-2 border-gray-700 shadow-lg bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center transition-transform hover:scale-105"
	>
		<div class="w-full h-full p-1 flex items-center justify-center">
			<div
				class="w-full h-full rounded border-2 border-blue-400 bg-blue-700"
				style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);"
			></div>
		</div>
	</div>
{:else if card}
	<!-- Card Face -->
	<div
		class="relative {sizeClasses} rounded-lg border-2 border-gray-300 shadow-lg bg-white flex flex-col transition-transform hover:scale-105"
	>
		<!-- Top-left corner -->
		<div class="absolute top-1 left-1 flex flex-col items-center leading-none">
			<span class="font-bold" class:text-red-600={suitColor === 'red'}>{card.rank}</span>
			<span class:text-red-600={suitColor === 'red'}>{suitSymbol}</span>
		</div>

		<!-- Center suit symbol -->
		<div class="flex-1 flex items-center justify-center">
			<span class="text-5xl" class:text-red-600={suitColor === 'red'}>{suitSymbol}</span>
		</div>

		<!-- Bottom-right corner (rotated) -->
		<div class="absolute bottom-1 right-1 flex flex-col items-center leading-none rotate-180">
			<span class="font-bold" class:text-red-600={suitColor === 'red'}>{card.rank}</span>
			<span class:text-red-600={suitColor === 'red'}>{suitSymbol}</span>
		</div>
	</div>
{:else}
	<!-- Empty slot -->
	<div
		class="relative {sizeClasses} rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 opacity-50"
	></div>
{/if}
