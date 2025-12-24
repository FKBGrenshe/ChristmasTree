import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base to './' so assets load correctly on GitHub Pages sub-paths
  base: './',
  build: {
    outDir: 'dist',
  }
});