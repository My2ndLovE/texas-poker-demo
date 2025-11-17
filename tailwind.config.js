/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				poker: {
					green: '#0f766e',
					felt: '#1a5f3a',
					darkGreen: '#064e3b',
					gold: '#fbbf24',
					silver: '#d1d5db'
				}
			},
			animation: {
				'card-deal': 'card-deal 0.5s ease-out forwards',
				'chip-slide': 'chip-slide 0.4s ease-in-out forwards',
				'winner-glow': 'winner-glow 1s ease-in-out infinite'
			},
			keyframes: {
				'card-deal': {
					'0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' },
					'50%': { transform: 'translate(var(--card-x), var(--card-y)) scale(0.8)', opacity: '0.5' },
					'100%': { transform: 'translate(var(--card-x), var(--card-y)) scale(1)', opacity: '1' }
				},
				'chip-slide': {
					'0%': { transform: 'translate(var(--start-x), var(--start-y))' },
					'100%': { transform: 'translate(var(--end-x), var(--end-y))' }
				},
				'winner-glow': {
					'0%, 100%': { boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(251, 191, 36, 1)' }
				}
			}
		}
	},
	plugins: []
};
