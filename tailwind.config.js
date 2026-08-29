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
        brand: {
          purple: '#393186',
          'purple-dark': '#292364',
          'purple-light': '#4c42ad',
          pink: '#E40981',
          'pink-dark': '#b80768',
          'pink-light': '#fa32a0',
          blue: '#01A0E2',
          'blue-dark': '#0182b8',
          'blue-light': '#2bbbf7',
          orange: '#F28C18',
          'orange-dark': '#c7700e',
          'orange-light': '#ffa439',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F7F8FC',
          card: '#F3F5FA',
          highlight: '#EEF7FB',
        },
        content: {
          primary: '#171725',
          secondary: '#5F6272',
          muted: '#85899A',
          border: '#E2E5ED',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Noto Naskh Arabic', 'Scheherazade New', 'Amiri', 'serif'],
        urdu: ['Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', 'serif'],
        hindi: ['Noto Sans Devanagari', 'Mukta', 'sans-serif'],
      },
      boxShadow: {
        'brand-sm': '0 2px 8px -1px rgba(57, 49, 134, 0.08)',
        'brand-md': '0 6px 20px -2px rgba(57, 49, 134, 0.12)',
        'brand-lg': '0 12px 32px -4px rgba(57, 49, 134, 0.16)',
        'pink-glow': '0 8px 24px -4px rgba(228, 9, 129, 0.3)',
        'purple-glow': '0 8px 24px -4px rgba(57, 49, 134, 0.3)',
      },
      backgroundImage: {
        'gradient-purple-blue': 'linear-gradient(135deg, #393186 0%, #01A0E2 100%)',
        'gradient-purple-pink': 'linear-gradient(135deg, #393186 0%, #E40981 100%)',
        'gradient-blue-purple': 'linear-gradient(135deg, #01A0E2 0%, #393186 100%)',
        'gradient-pink-purple': 'linear-gradient(135deg, #E40981 0%, #393186 100%)',
      }
    },
  },
  plugins: [],
}
