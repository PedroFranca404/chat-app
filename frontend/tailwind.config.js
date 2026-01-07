/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blackred': '#280404ff',
        'darkred': '#380505ff',
      }
    },
  },
  plugins: [],
}