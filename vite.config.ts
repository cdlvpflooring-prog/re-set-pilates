import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react()],
  // The preview app assigns a free port through PORT when 5173 is taken
  server: { port: Number(process.env.PORT) || 5173 },
});
