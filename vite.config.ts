import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Esta línea es crucial, le dice a Vitest dónde está tu setup
    setupFiles: './test/setup.ts' 
  }
})