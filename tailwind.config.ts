import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#46521F",
        income:  "#7B8A4A",
        expense: "#C46A3A",
        charcoal: "#2B2C24",
        cream:   "#F2E8D5",
      },
    },
  },
  plugins: [],
};

export default config;
