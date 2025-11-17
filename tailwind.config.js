/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Poker-themed colors
        felt: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#0d5c2f', // Main felt green
          600: '#094a25',
          700: '#14532d',
          800: '#052e16',
          900: '#021810',
        },
        chip: {
          white: '#ffffff',
          red: '#dc2626',
          blue: '#2563eb',
          green: '#16a34a',
          black: '#000000',
          purple: '#9333ea',
        },
        card: {
          red: '#dc2626', // Hearts, Diamonds
          black: '#000000', // Spades, Clubs
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'card-deal': 'cardDeal 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        cardDeal: {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
