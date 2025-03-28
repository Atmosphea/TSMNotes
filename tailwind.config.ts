import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.075rem", // Adjusted radius
        md: "calc(0.075rem - 2px)", // Adjusted radius
        sm: "calc(0.075rem - 4px)", // Adjusted radius
      },
      colors: {
        background: "#000", // Black background
        foreground: "#fff", // White text
        card: {
          DEFAULT: "#fff", // White card background
          foreground: "#000", // Black card text
        },
        popover: {
          DEFAULT: "#fff", // White popover background
          foreground: "#000", // Black popover text
        },
        primary: {
          DEFAULT: "#fff", // White primary background (adjust as needed)
          foreground: "#000", // Black primary text
        },
        secondary: {
          DEFAULT: "#fff", // White secondary background (adjust as needed)
          foreground: "#000", // Black secondary text
        },
        muted: {
          DEFAULT: "#fff", // White muted background (adjust as needed)
          foreground: "#000", // Black muted text
        },
        accent: {
          DEFAULT: "#fff", // White accent background (adjust as needed)
          foreground: "#000", // Black accent text
        },
        destructive: {
          DEFAULT: "#fff", // White destructive background (adjust as needed)
          foreground: "#000", // Black destructive text
        },
        border: "#fff", // White border
        input: "#fff", // White input background (adjust as needed)
        ring: "#fff", // White ring (adjust as needed)
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "#000", // Black sidebar background
          foreground: "#fff", // White sidebar text
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "#fff", // White sidebar border
          ring: "#fff", // White sidebar ring
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;