/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: '#8B0000',
        'rose-gold': '#B76E79',
        midnight: '#080808',
        obsidian: '#121212',
        pearl: '#FAFAFA',
        brand: {
          red600: '#DC2626',
          red700: '#B91C1C',
          gold400: '#D4AF37',
        },
        surface: {
          900: '#0B0F14',
          800: '#11161D',
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        lux: '0 10px 40px -15px rgba(212,175,55,0.35)',
        panel: '0 10px 24px -12px rgba(0,0,0,0.5)',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      transitionDuration: {
        120: '120ms',
        180: '180ms',
        240: '240ms',
        360: '360ms',
      },
    },
  },
  plugins: [],
}
