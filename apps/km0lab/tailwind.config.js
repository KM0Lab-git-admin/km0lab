/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/components/**/*.{js,jsx,ts,tsx}',
    '../../packages/app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f5f5',
        },
        content: {
          DEFAULT: '#171717',
          muted: '#737373',
        },
      },
    },
  },
  plugins: [],
}
