import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F2937",
        panel: "#F8FAFC",
        line: "#E5E7EB",
        saffron: "#FEF3C7",
        teal: "#0F766E",
        cranberry: "#BE123C"
      },
      boxShadow: {
        soft: "0 10px 24px rgba(15, 23, 42, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
