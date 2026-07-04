import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SkyUp Gold Savings',
        short_name: 'SkyUp Gold',
        description: 'Track your monthly gold savings scheme',
        theme_color: '#0B1F3E',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  build: { outDir: 'dist-user' },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
    },
  },
})