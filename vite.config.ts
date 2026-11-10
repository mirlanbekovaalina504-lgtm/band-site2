import { defineConfig } from 'vite';

// base './' — сайт работает на GitHub Pages при любом названии репозитория
export default defineConfig({
  base: './',
  build: { outDir: 'dist' },
});
