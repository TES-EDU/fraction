import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['온글잎 박다현체.ttf', 'favicon.svg'],
      workbox: {
        mode: 'development',
      },
      manifest: {
        name: 'TES 분수 학습',
        short_name: '분수 학습',
        description: '초등학생을 위한 분수 학습',
        theme_color: '#FFFEEA',
        background_color: '#FFFEEA',
        display: 'standalone',
        orientation: 'landscape',
        start_url: './',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
