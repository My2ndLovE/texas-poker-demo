/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': '390px',     // Large phones landscape (iPhone 14 Pro)
        'tablet': '768px',     // Tablets (iPad Mini landscape)
        'laptop': '1366px',    // Laptops (MacBook Air)
        'desktop': '1920px'    // Desktops (Full HD)
      },
      colors: {
        poker: {
          felt: {
            DEFAULT: '#0D5C0D',
            dark: '#094A09',
            light: '#117B11',
          },
          chip: {
            white: '#FFFFFF',
            red: '#DC2626',
            blue: '#2563EB',
            green: '#16A34A',
            black: '#1F2937',
          }
        }
      },
      animation: {
        'card-deal': 'cardDeal 0.5s ease-out',
        'chip-slide': 'chipSlide 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(-100px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
