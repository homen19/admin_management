import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill Node.js `global` for sockjs-client (CJS package used in browser)
    global: 'globalThis',
  },
})
