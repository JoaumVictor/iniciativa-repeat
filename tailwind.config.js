/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#0b1120",
          900: "#111827",
          800: "#1f2937",
        },
        accent: {
          50: "#eff6ff",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
