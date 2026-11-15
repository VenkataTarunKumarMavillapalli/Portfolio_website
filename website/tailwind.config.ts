import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0A6EB4",
          cyan: "#35A8E0",
          ice: "#EAF5FB",
          navy: "#071521",
          ink: "#101820",
          steel: "#DCE6ED",
          warm: "#FBFAF7",
          sand: "#D6C6A1"
        }
      },
      boxShadow: {
        premium: "0 40px 120px rgba(7, 21, 33, 0.18)",
        blue: "0 30px 80px rgba(10, 110, 180, 0.25)"
      },
      fontFamily: {
        sans: ["Open Sans", "Noto Sans", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
