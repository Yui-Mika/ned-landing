import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this repo at https://yui-mika.github.io/ned-landing/
// Override with BASE_PATH=/ for a custom domain or local preview at the root.
const base = process.env.BASE_PATH ?? '/ned-landing/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        // three.js gets its own chunk (loaded lazily with the scene), so the
        // "initial JS excluding three.js < 250 KB gzip" budget can be measured.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
});
