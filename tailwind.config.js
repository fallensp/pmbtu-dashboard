/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: '#ef4444',
        high: '#f97316',
        moderate: '#eab308',
        normal: '#22c55e',
        shutdown: '#9ca3af',
      },
    },
  },
  plugins: [],
}
