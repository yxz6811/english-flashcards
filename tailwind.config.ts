import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAFAF9",
          text: "#0C0A09",
          accent: "#CA8A04",
          card: "#FFFFFF",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
