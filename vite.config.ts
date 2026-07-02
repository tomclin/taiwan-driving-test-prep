import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: './' keeps asset paths relative so the same build works on
// Vercel (root) and GitHub Pages (/repo/ subpath) without changes.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'questions.json'],
      manifest: {
        name: '汽車駕照筆試通 2026',
        short_name: '駕照筆試通',
        description: '台灣汽車駕照筆試（2026 新制）練習與模擬考',
        lang: 'zh-Hant',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,woff2,png}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
