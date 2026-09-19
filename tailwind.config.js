/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        debzane: {
          blue: {
            50: '#f0f7ff',
            100: '#e0effe',
            200: '#bae0fd',
            300: '#7cc7fb',
            400: '#38aaf7',
            500: '#0e8ee9', // Vibrant bird blue
            600: '#0270c7',
            700: '#0359a1',
            800: '#074c84',
            900: '#0c406e',
            950: '#051b33', // Deep midnight navy
          },
          teal: {
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
          },
          gold: {
            300: '#fde047',
            400: '#facc15',
            500: '#eab308', // Regal embroidered gold
            600: '#ca8a04',
            700: '#a16207',
          }
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
