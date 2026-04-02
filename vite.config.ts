import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { wireframeGitHistoryPlugin } from './vite-plugin-wireframe-git-history'

export default defineConfig({
  plugins: [react(), wireframeGitHistoryPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
