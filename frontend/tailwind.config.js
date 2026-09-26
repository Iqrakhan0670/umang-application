export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A18",
        pine: "#0F2E2B",
        "pine-light": "#16433E",
        parchment: "#F6F1E7",
        "parchment-dim": "#EFE7D6",
        brass: "#B8863E",
        "brass-light": "#D3A968",
        clay: "#C4442E",
        stone: "#6B6558",
        "umang-dark": "#0f3a2d",
        "umang-mint": "#eaf3ec",
        "umang-mint-light": "#f5faf6",
        "umang-blue": "#3b6fd6",
        "umang-purple": "#8b6fd6",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
};