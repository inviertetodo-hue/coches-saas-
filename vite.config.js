import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/autoscout-direct": {
        target: "https://www.autoscout24.de",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/autoscout-direct/, ""),
      },
    },
  },
})
