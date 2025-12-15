import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Bypass gateway (8080) and hit services directly during dev
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/')
      },
      '/api/usuarios': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/')
      },
      '/api/productos': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/')
      },
      '/api/pedidos': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/')
      },
      '/api/contacto': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts'
  }
})
