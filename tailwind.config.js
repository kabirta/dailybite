/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#9333EA",
        accent: "#F59E0B",
      },
      fontFamily: {
        sans: ["YourCustomFont-Regular", "System"],
        heading: ["YourCustomFont-Bold", "System"],
      },
    },
  },
  plugins: [],
};
