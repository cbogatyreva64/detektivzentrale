/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// base './' = relative Pfade, damit die App unter jeder Unter-URL
// (z. B. GitHub Pages: https://name.github.io/detektivzentrale/) läuft.
export default defineConfig({
  base: './',
  plugins: [preact()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
