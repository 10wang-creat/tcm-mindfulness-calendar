/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tcm-brown': '#8B4513',
        'tcm-green': '#2D5016',
        'tcm-red': '#C41E3A',
        'tcm-cream': '#FAF8F5',
        'tcm-paper': '#F5F5F0',
        'tcm-ink': '#1A1A1A',
      },
      fontFamily: {
        'serif-tc': ['Noto Serif TC', 'serif'],
        'sans-tc': ['Noto Sans TC', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
