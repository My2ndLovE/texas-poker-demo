<script lang="ts">
	import { uiStore, dismissToast } from '$stores/uiStore';
	import { fade, fly } from 'svelte/transition';

	function getToastColor(type: 'info' | 'error' | 'success') {
		switch (type) {
			case 'success':
				return 'bg-green-600';
			case 'error':
				return 'bg-red-600';
			case 'info':
			default:
				return 'bg-blue-600';
		}
	}

	function getToastIcon(type: 'info' | 'error' | 'success') {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'info':
			default:
				return 'ℹ';
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
	{#each $uiStore.toasts as toast (toast.id)}
		<div
			transition:fly={{ x: 300, duration: 300 }}
			class="pointer-events-auto {getToastColor(
				toast.type
			)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]"
		>
			<span class="text-xl font-bold">{getToastIcon(toast.type)}</span>
			<span class="flex-1">{toast.message}</span>
			<button
				onclick={() => dismissToast(toast.id)}
				class="text-white hover:text-gray-200 transition-colors ml-2"
			>
				✕
			</button>
		</div>
	{/each}
</div>
