/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: "#07111F",          // Deep ink navy
          midnight: "#0B1928",    // Midnight blue
          surface: "#0E2138",     // Panel surface
          surfaceLight: "#132B45",// Lighter panel
          border: "#1C3554",      // Fine structural border
          borderLight: "#2A4B75", // Highlight border
          ivory: "#F5F1E8",       // Warm ivory
          lime: "#D7FF55",        // Acid lime accent
          limeMuted: "#B8E636",   // Muted lime
          steel: "#8D9CAF",       // Muted steel text/lines
          coral: "#FF655D",       // Electric coral for gaps/attention
          emerald: "#10B981",     // Restrained emerald for verified
          emeraldDark: "#065F46", // Dark emerald
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
