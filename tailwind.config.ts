import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05040a",
        nebula: {
          50: "#f1eeff",
          100: "#e1daff",
          400: "#9b7dff",
          500: "#7c4dff",
          600: "#5f2eea",
          700: "#4820b8",
        },
        ember: {
          400: "#ff8a5b",
          500: "#ff6b3d",
        },
        cosmic: {
          900: "#0a0714",
          800: "#100c1f",
          700: "#181229",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 77, 255, 0.55)",
        "glow-lg": "0 0 80px -12px rgba(124, 77, 255, 0.65)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3.5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
