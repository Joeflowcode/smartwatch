import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [react(), netlify()],
  test: {
    environment: "node",
    include: ["src/test/**/*.test.ts"],
  },
});
