/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: {
            50: '#F0F5FA',
            100: '#E0EBF5',
            700: '#1A3B5D',
            800: '#132E4F',
            900: '#0F2942',
            950: '#0A1C2E',
          },
          blue: {
            50: '#EFF6FF',
            500: '#2563EB',
            600: '#1E56A0',
            700: '#17427D',
          },
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Mukta Malar', 'sans-serif'],
        tamil: ['"Mukta Malar"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
