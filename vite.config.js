import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/story-app/',
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src/public'),

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',

      registerType: 'autoUpdate',
      injectRegister: 'inline',

      devOptions: {
        enabled: true,
        type: 'module',
      },

      // SATU-SATUNYA MANIFEST
      manifest: {
        name: 'Story App',
        short_name: 'StoryApp',
        description: 'Aplikasi Berbagi Cerita',
        start_url: '/story-app/',
        scope: '/story-app/',
        display: 'standalone',
        background_color: '#87cefa',
        theme_color: '#87cefa',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // PASTIKAN HTML & APP SHELL KE-CACHE
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});
