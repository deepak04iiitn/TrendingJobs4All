import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Keep SSE judge progress streaming
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (String(proxyRes.headers['content-type'] || '').includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache, no-transform';
              proxyRes.headers['x-accel-buffering'] = 'no';
            }
          });
        },
      },
      '/sitemap.xml': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/sitemap-stats': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/llms.txt': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/llms-stats': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})