/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Tajawal"', '"Cairo"', 'sans-serif']
      },
      colors: {
        // لوحة صناعية: أزرق فولاذي + برتقالي تحذيري + رمادي معدني
        steel: {
          50: '#f3f6f8',
          100: '#e2e9ee',
          200: '#c3d2dc',
          300: '#95acbd',
          400: '#647f97',
          500: '#48627a',
          600: '#374d63',
          700: '#2c3d50',
          800: '#1f2c3a',
          900: '#141d27',
          950: '#0b1119'
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626'
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a'
        }
      },
      boxShadow: {
        industrial: '0 4px 14px 0 rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: []
};
