import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/work-to-parents/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Class Photo Wall',
        short_name: 'Class Wall',
        description: 'Teachers snap classroom photos; parents view the shared gallery',
        theme_color: '#0f3d4c',
        background_color: '#0f3d4c',
        display: 'standalone',
        orientation: 'any',
        start_url: '/work-to-parents/',
        scope: '/work-to-parents/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
