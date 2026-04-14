/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        sushi: {
          red:       "#c0392b",
          "red-dark":"#9b2c1f",
          "red-soft":"#fef2f0",
          gold:      "#b8860b",
          ink:       "#0d0c0a",
          "ink-2":   "#1a1714",
          cream:     "#f5f0ea",
          "cream-2": "#ede6db",
          warm:      "#8a7060",
        },
      },
    },
  },
  plugins: [],
};
