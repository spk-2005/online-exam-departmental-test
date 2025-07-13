/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Define custom animations
      animation: {
        // Marquee animation: moves horizontally
        marquee: 'marquee 15s linear infinite', 
        // Color blink animation: cycles text color
        'color-blink': 'color-blink 2s linear infinite', 
      },
      // Define the keyframes for the animations
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        // Keyframes for color blinking
        'color-blink': {
          '0%, 100%': { color: '#ef4444' }, // Red-500
          '25%': { color: '#f97316' },      // Orange-500
          '50%': { color: '#f59e0b' },      // Amber-500
          '75%': { color: '#10b981' },      // Green-500
        },
      },
    },
  },
  plugins: [],
}