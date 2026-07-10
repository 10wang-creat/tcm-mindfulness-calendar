/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 夏季冷柔色盤（與 src/theme.js 對齊）
      colors: {
        'tcm-navy': '#34435E',      // 藏藍（錨色）
        'tcm-sage': '#6E967F',      // 鼠尾草綠（品牌錨）
        'tcm-lavender': '#BBADD8',  // 薰衣草
        'tcm-wisteria': '#8981C2',  // 紫藤
        'tcm-mist': '#AAC9E8',      // 霧藍
        'tcm-sea': '#6D93C8',       // 海藍
        'tcm-mint': '#A9D7BC',      // 薄荷
        'tcm-pearl': '#F0EEF3',     // 珍珠白
        'tcm-silver': '#C3CBD8',    // 銀
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
