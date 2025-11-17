import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'**/*.config.*',
				'**/dist/**',
				'**/.svelte-kit/**',
				'**/node_modules/**'
			],
			thresholds: {
				statements: 80,
				branches: 75,
				functions: 80,
				lines: 80
			}
		}
	}
});
