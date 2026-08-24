/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary brand (indigo/purple) ─────────────────────────
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",   // DEFAULT — primary CTA color
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          DEFAULT: "#4f46e5",
          dark:    "#3730a3",
        },

        // ── Semantic status colors ─────────────────────────────────
        // "delivered" / positive
        success: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          DEFAULT: "#059669",
        },
        // "out for delivery" / attention
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          DEFAULT: "#d97706",
        },
        // "failed" / destructive
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          DEFAULT: "#dc2626",
        },
        // "in transit" / informational
        info: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          DEFAULT: "#2563eb",
        },

        // ── Neutral surface tokens (centralize raw slate usage) ────
        surface: {
          DEFAULT: "#f8fafc",   // page background
          card:    "#ffffff",   // card / elevated surface
          muted:   "#f1f5f9",   // hover backgrounds, subtle fills
          border:  "#e2e8f0",   // standard borders (was slate-200)
          "border-muted": "#f1f5f9",  // hairline borders (was slate-100)
        },

        // ── Text scale tokens ─────────────────────────────────────
        ink: {
          DEFAULT: "#0f172a",   // headings / high emphasis (was slate-900)
          secondary: "#475569", // body text (was slate-600)
          muted:     "#94a3b8", // metadata / labels (was slate-400)
          disabled:  "#cbd5e1", // disabled / placeholder
        },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },

      boxShadow: {
        // Elevation scale — subtle, not material-design-heavy
        xs:   "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm:   "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 16px 0 rgb(0 0 0 / 0.08), 0 1px 4px 0 rgb(0 0 0 / 0.05)",
        "card-focus": "0 0 0 2px #e0e7ff, 0 4px 16px 0 rgb(0 0 0 / 0.08)",
        brand: "0 4px 14px 0 rgb(79 70 229 / 0.30)",
        "brand-sm": "0 2px 8px 0 rgb(79 70 229 / 0.20)",
        inner: "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },

      spacing: {
        // Consistent section spacing
        18: "4.5rem",
        22: "5.5rem",
      },

      backgroundImage: {
        // Subtle dot-grid for hero section (pure CSS, no image file)
        "dot-grid": "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
      },

      backgroundSize: {
        "dot-grid": "24px 24px",
      },

      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
