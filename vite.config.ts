import { defineConfig } from 'vitest/config';
import path from "node:path";
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'ES2023',
    minify: 'esbuild',
    cssMinify: true
  },
  // https://vitest.dev/config/
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ["text", "json", "html"],
      include: [
        "src/components/**/*.{ts,tsx,js,jsx}",
        "src/hooks/**/*.{ts,tsx,js,jsx}",
        "src/utils/**/*.{ts,tsx,js,jsx}",
      ],
      exclude: [
        "src/App.tsx",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
