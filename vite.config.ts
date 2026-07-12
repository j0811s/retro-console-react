import { defineConfig } from 'vitest/config';
import path from "node:path";
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'baseline-widely-available',
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
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [
    nodePolyfills({
      // 'buffer', 'stream', 'util', and 'assert' are zlib's own transitive
      // dependencies (browserify-zlib's implementation requires all four
      // directly) — they must be polyfilled too, not just 'zlib' itself.
      include: ['zlib', 'buffer', 'stream', 'util', 'assert'],
      overrides: {
        // browserify-zlib alone is missing the `constants` named export
        // just-bash needs; src/lib/polyfills/zlib.ts adds it. See that
        // file for details.
        zlib: path.resolve(__dirname, "src/lib/polyfills/zlib.ts"),
      },
      globals: {
        Buffer: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
