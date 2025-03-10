/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 12s linear infinite",
      },
    },
    screens: {
      xs: "320px",
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
