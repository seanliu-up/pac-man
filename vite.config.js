import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/pac-man/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  server: {
    port: 5173,
  },
});
