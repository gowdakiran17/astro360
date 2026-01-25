import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/chart': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/match': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/geo': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/charts': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Removed /tools proxy - these are frontend routes, not API endpoints
    }
  }
})
