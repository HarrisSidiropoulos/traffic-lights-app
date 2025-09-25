import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const base = isGithubPages ? "/traffic-lights-app/" : "/";

export default defineConfig({
  base,
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          xstate: ["xstate", "@xstate/react"],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
