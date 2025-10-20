import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef6ee",
          100: "#fdecd7",
          200: "#fad5ae",
          300: "#f7b77a",
          400: "#f38f44",
          500: "#f07020",
          600: "#e15416",
          700: "#ba3f14",
          800: "#943318",
          900: "#782d16",
          950: "#41140a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
