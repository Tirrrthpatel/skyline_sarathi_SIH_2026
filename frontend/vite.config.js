import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
    watch: {
      ignored: ['**/public/**']
    }
  },
  preview: {
    host: true,
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
