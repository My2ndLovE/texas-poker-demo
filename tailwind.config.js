/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'poker-green': {
          DEFAULT: '#0D7E3B',
          dark: '#0A5C2C',
          light: '#10B759',
        },
        'poker-felt': '#0D5E3B',
        'chip-red': '#DC2626',
        'chip-blue': '#2563EB',
        'chip-green': '#16A34A',
        'chip-black': '#1F2937',
        'chip-white': '#F9FAFB',
      },
      animation: {
        'card-deal': 'card-deal 0.5s ease-out forwards',
        'chip-slide': 'chip-slide 0.4s ease-in-out forwards',
        'winner-glow': 'winner-glow 0.6s ease-in-out infinite',
      },
      keyframes: {
        'card-deal': {
          '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' },
          '100%': { transform: 'translate(var(--card-x, 0), var(--card-y, 0)) scale(1)', opacity: '1' },
        },
        'chip-slide': {
          '0%': { transform: 'translate(var(--start-x, 0), var(--start-y, 0))' },
          '100%': { transform: 'translate(var(--end-x, 0), var(--end-y, 0))' },
        },
        'winner-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 1)' },
        },
      },
    },
  },
  plugins: [],
};
