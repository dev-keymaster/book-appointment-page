import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#111827",
        border: "#1E293B",
        primary: "#2563EB",
        primaryHover: "#3B82F6",
        muted: "#94A3B8"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 24px 70px rgba(2, 6, 23, 0.36)"
      }
    }
  },
  plugins: []
};

export default config;
