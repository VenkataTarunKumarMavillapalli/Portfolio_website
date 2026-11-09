import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("/three/") || id.includes("/@react-three/"))
              return "webgl";
            if (id.includes("/react") || id.includes("/scheduler/"))
              return "react-vendor";
            if (
              id.includes("/motion") ||
              id.includes("/framer-motion/") ||
              id.includes("/gsap/")
            )
              return "motion";
          }
        },
      },
    },
  },
  server: { host: "0.0.0.0" },
});
