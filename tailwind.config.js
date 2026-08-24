/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary brand (Electric Violet) ─────────────────────────
        brand: {
          50:  "#f3e8ff",
          100: "#e9d5ff",
          200: "#d8b4fe",
          300: "#c084fc",
          400: "#A855F7", // Violet highlight
          500: "#8b5cf6",
          600: "#7C3AED", // DEFAULT — Electric Violet
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#7C3AED",
          dark:    "#5b21b6",
        },

        // ── Logistics Dark Theme ───────────────────────────────────
        midnight: {
          DEFAULT: "#0B1020", // Hero, Nav, Dark Sections
          surface: "#121A2B", // Cards, Panels in dark mode
        },

        // ── Semantic status colors ─────────────────────────────────
        // "delivered" / positive (Delivery Green)
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e", 
          600: "#16a34a",
          700: "#15803d",
          DEFAULT: "#22c55e",
        },
        // "out for delivery" / attention (Delivery Orange)
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          DEFAULT: "#f59e0b",
        },
        // "failed" / destructive / urgent (Coral)
        danger: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          DEFAULT: "#f97316",
        },
        // "in transit" / informational (fallback)
        info: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          DEFAULT: "#3b82f6",
        },

        // ── Neutral surface tokens ────
        surface: {
          DEFAULT: "#F8F7F4",   // light warm background
          card:    "#ffffff",   // card / elevated surface
          muted:   "#f1f5f9",   // hover backgrounds, subtle fills
          border:  "#e2e8f0",   // standard borders
          "border-muted": "#f1f5f9",  // hairline borders
        },

        // ── Text scale tokens ─────────────────────────────────────
        ink: {
          DEFAULT: "#0f172a",   // headings / high emphasis
          secondary: "#475569", // body text
          muted:     "#94a3b8", // metadata / labels
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
        "pulse-status": "pulseStatus 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-live": "pulseLive 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-right": "slideRight 2s linear infinite",
        "route-dash": "routeDash 20s linear infinite",
        "route-flow": "routeFlow 1.5s linear infinite",
        "float": "float 5s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseStatus: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        routeDash: {
          "to": { strokeDashoffset: "-400" },
        },
        routeFlow: {
          "to": { strokeDashoffset: "-24" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseLive: {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(34, 197, 94, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)" },
        }
      },
    },
  },
  plugins: [],
};
