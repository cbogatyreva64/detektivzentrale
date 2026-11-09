/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' = relative Pfade, damit die App unter jeder Unter-URL
// (z. B. GitHub Pages: https://name.github.io/detektivzentrale/) läuft.
export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      // Updates nicht sofort einspielen, sondern erst, wenn kein Fall offen ist (src/pwa.ts)
      registerType: 'prompt',
      injectRegister: false,
      includeManifestIcons: false, // Icons kommen schon über globPatterns mit
      manifest: {
        id: './',
        name: 'Detektivzentrale',
        short_name: 'Detektive',
        description: 'Begleiter zum Detektiv-Adventskalender',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f4ecdc',
        theme_color: '#1f3a5f',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Alles vorab speichern → die App läuft komplett ohne Internet
        // (manifest.webmanifest fügt das Plugin selbst hinzu)
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
