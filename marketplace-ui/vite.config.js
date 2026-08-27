import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project sites are served from /<repo-name>/, not /.
// Override with VITE_BASE_PATH for a custom domain or a user/org root page.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/dev-digest-ai-marketplace/",
  plugins: [react()],
});
