<script lang="ts">
	import { goto } from '$app/navigation';
	import { settingsStore, updateSetting } from '$stores/settingsStore';
	import { ArrowLeft, Save } from 'lucide-svelte';

	function handleSave() {
		goto('/');
	}

	function handleCancel() {
		goto('/');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-poker-darkGreen to-poker-green p-8">
	<div class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="flex items-center mb-8">
			<button
				on:click={handleCancel}
				class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
			>
				<ArrowLeft size={20} />
				Back
			</button>
			<h1 class="text-3xl font-bold text-white ml-8">Game Settings</h1>
		</div>

		<!-- Settings Form -->
		<div class="bg-white rounded-lg shadow-xl p-8 space-y-6">
			<!-- Number of Bots -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Number of Opponents (Bots)
				</label>
				<input
					type="range"
					min="1"
					max="8"
					bind:value={$settingsStore.numBots}
					class="w-full"
				/>
				<div class="text-center text-gray-600 mt-1">{$settingsStore.numBots} bots</div>
			</div>

			<!-- Bot Difficulty -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Bot Difficulty
				</label>
				<select
					bind:value={$settingsStore.botDifficulty}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
				>
					<option value="easy">Easy (Beginner)</option>
					<option value="medium">Medium (Intermediate)</option>
					<option value="hard">Hard (Advanced)</option>
					<option value="mixed">Mixed (Variety)</option>
				</select>
			</div>

			<!-- Starting Chips -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Starting Chips
				</label>
				<select
					bind:value={$settingsStore.startingChips}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
				>
					<option value={500}>$500</option>
					<option value={1000}>$1,000</option>
					<option value={2000}>$2,000</option>
					<option value={5000}>$5,000</option>
					<option value={10000}>$10,000</option>
				</select>
			</div>

			<!-- Blinds -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Blind Level (Small/Big)
				</label>
				<select
					bind:value={$settingsStore.blindLevel}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
				>
					<option value={{ small: 5, big: 10 }}>$5/$10</option>
					<option value={{ small: 10, big: 20 }}>$10/$20</option>
					<option value={{ small: 25, big: 50 }}>$25/$50</option>
					<option value={{ small: 50, big: 100 }}>$50/$100</option>
					<option value={{ small: 100, big: 200 }}>$100/$200</option>
				</select>
			</div>

			<!-- Animation Speed -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Animation Speed
				</label>
				<select
					bind:value={$settingsStore.animationSpeed}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
				>
					<option value="off">Off</option>
					<option value="fast">Fast</option>
					<option value="normal">Normal</option>
					<option value="slow">Slow</option>
				</select>
			</div>

			<!-- Action Timer -->
			<div>
				<label class="block text-gray-700 font-semibold mb-2">
					Action Timer
				</label>
				<select
					bind:value={$settingsStore.actionTimer}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-poker-green"
				>
					<option value={0}>Off</option>
					<option value={15}>15 seconds</option>
					<option value={30}>30 seconds</option>
					<option value={60}>60 seconds</option>
				</select>
			</div>

			<!-- Sound Effects -->
			<div class="flex items-center">
				<input
					type="checkbox"
					bind:checked={$settingsStore.soundEffects}
					class="w-5 h-5 text-poker-green rounded focus:ring-2 focus:ring-poker-green"
				/>
				<label class="ml-3 text-gray-700 font-semibold">
					Enable Sound Effects
				</label>
			</div>

			<!-- Buttons -->
			<div class="flex gap-4 pt-4">
				<button
					on:click={handleSave}
					class="flex-1 bg-poker-green hover:bg-poker-darkGreen text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
				>
					<Save size={20} />
					Save Settings
				</button>
				<button
					on:click={handleCancel}
					class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>

		<!-- Info -->
		<div class="mt-6 text-center text-gray-200 text-sm">
			<p>Settings are automatically saved to your browser</p>
		</div>
	</div>
</div>
