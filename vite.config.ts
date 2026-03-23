import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 8090,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
