import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // In development the API runs separately under `npm run dev:api`.
  server: {
    proxy: { "/api": "http://localhost:8787" },
  },
});
