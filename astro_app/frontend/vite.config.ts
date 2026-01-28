import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0) to avoid IPv6/IPv4 conflicts
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/chart': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/match': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/geo': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/charts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/business': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/vastu': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/research': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tools': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})
