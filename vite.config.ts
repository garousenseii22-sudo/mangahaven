import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    hmr: false,  // Disable hot reload to avoid timer issues in constrained environments
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      maxParallelFileOps: 1,
    },
    minify: false,
  },
});
