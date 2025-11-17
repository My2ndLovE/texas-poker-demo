/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': {
          light: '#3d8b40',
          DEFAULT: '#2a5f2c',
          dark: '#1a3d1c',
        },
        'chip-red': '#dc2626',
        'chip-blue': '#2563eb',
        'chip-green': '#16a34a',
        'chip-black': '#171717',
        'chip-white': '#f5f5f5',
      },
      animation: {
        'deal-card': 'deal 0.5s ease-out forwards',
        'slide-chip': 'slide 0.4s ease-in-out forwards',
        'winner-glow': 'glow 1s ease-in-out infinite',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' },
          '50%': { transform: 'translate(var(--card-x), var(--card-y)) scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'translate(var(--card-x), var(--card-y)) scale(1)', opacity: '1' },
        },
        slide: {
          '0%': { transform: 'translate(var(--start-x), var(--start-y))' },
          '100%': { transform: 'translate(var(--end-x), var(--end-y))' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
