import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "logic",
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["src/**/*.test.tsx"],
          environment: "jsdom",
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.jsx", "src/vite-env.d.ts"],
    },
  },
});
