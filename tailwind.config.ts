import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          felt: '#0d5e1a',
          'felt-dark': '#0a4d15',
          'card-red': '#ff0000',
          'card-black': '#000000',
          gold: '#ffd700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'card-deal': 'cardDeal 0.5s ease-out',
        'chip-slide': 'chipSlide 0.4s ease-in-out',
        'winner-glow': 'winnerGlow 1s ease-in-out infinite',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'scale(0.5) translateY(-100px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y))' },
        },
        winnerGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
