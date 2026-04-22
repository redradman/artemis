import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/@react-three/')) return 'three'
          if (id.includes('node_modules/')) return 'vendor'
        },
      },
    },
  },
})
