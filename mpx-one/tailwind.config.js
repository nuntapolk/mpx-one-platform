/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mpx: {
          navy:    '#0D1B3E',
          teal:    '#02C39A',
          amber:   '#EF9F27',
          emerald: '#1D9E75',
          red:     '#E24B4A',
          blue:    '#378ADD',
          purple:  '#7F77DD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
