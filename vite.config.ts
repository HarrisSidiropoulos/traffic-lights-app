import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Set base path conditionally for GitHub Pages
const isGithubPages = process.env.GITHUB_PAGES === "true";
const base = isGithubPages ? "/traffic-lights-app/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
});
