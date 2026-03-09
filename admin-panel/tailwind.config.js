/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#2D9B4E', dark: '#1E6B35', light: '#4EC76A' },
      },
    },
  },
  plugins: [],
};
