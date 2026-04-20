import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'engine'),
      '@data': path.resolve(__dirname, 'data'),
      '@theme': path.resolve(__dirname, 'theme'),
    },
  },
  server: {
    port: 5173,
  },
})
