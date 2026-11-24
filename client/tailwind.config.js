/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yt: {
          bg: '#0F0F0F',
          header: '#0F0F0F',
          sidebar: '#0F0F0F',
          surface1: '#181818',
          surface2: '#212121',
          hover: '#272727',
          border: '#303030',
          divider: '#303030',
          text: '#F1F1F1',
          textSecondary: '#AAAAAA',
          textMuted: '#717171',
          red: '#FF0033',
          redHover: '#CC0029',
          mod: '#3EA6FF',
          green: '#2BAE66',
          yellow: '#F0B429',
          error: '#FF4E45',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
