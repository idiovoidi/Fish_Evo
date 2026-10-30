import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8090,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 6000
  }
});
