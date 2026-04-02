import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/details': {
        target: 'https://navyanakka.app.n8n.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/api\/details/, '/webhook/details'), // ✅ production webhook
      },
    },
  },
})