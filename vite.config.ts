import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: Number((globalThis as any).process?.env.PORT) || 5173 },
});
