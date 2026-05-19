import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFF",
        text: "#111827",
        muted: "#6B7280",
        border: "#E5E7EB",
        primary: "#7C3AED",
        secondary: "#60A5FA",
        blush: "#F9A8D4",
        cyan: "#A5F3FC"
      },
      boxShadow: {
        glow: "0 18px 80px rgba(124, 58, 237, 0.14)",
        soft: "0 20px 50px rgba(148, 163, 184, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backdropBlur: {
        xs: "2px"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 10% 20%, rgba(96, 165, 250, 0.22), transparent 28%), radial-gradient(circle at 85% 12%, rgba(249, 168, 212, 0.22), transparent 24%), radial-gradient(circle at 82% 80%, rgba(165, 243, 252, 0.2), transparent 18%), linear-gradient(135deg, #f8faff 0%, #fdf7ff 48%, #f6fbff 100%)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.98)", opacity: "0.7" },
          "100%": { transform: "scale(1.04)", opacity: "1" }
        }
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite",
        pulseRing: "pulseRing 2.2s ease-in-out infinite alternate"
      }
    }
  },
  plugins: []
} satisfies Config;

