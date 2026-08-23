/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",   // primary — indigo, intentional, not generic blue
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          DEFAULT: "#4f46e5",
          dark:    "#3730a3",
        },
        accent: {
          DEFAULT: "#f59e0b",   // amber — used for COD badges, attention states
          dark:    "#d97706",
        },
        surface: {
          DEFAULT: "#f8fafc",
          card:    "#ffffff",
          muted:   "#f1f5f9",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        brand: "0 4px 14px 0 rgb(79 70 229 / 0.35)",
      },
    },
  },
  plugins: [],
};
