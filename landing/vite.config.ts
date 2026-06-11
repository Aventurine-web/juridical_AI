import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Same setup as AgentFoundry's frontend.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Proxy ADK api_server so the browser avoids CORS in dev.
    // Run `adk api_server` (default :8000) from the repo root.
    proxy: {
      "/adk": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/adk/, ""),
      },
    },
  },
})
