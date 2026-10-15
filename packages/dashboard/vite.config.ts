import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/switchbridge/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true, // Needed for reliable file change detection in Docker mounts
    },
    proxy: {
      '/switchbridge/api': {
        target: process.env.VITE_API_TARGET || 'http://server:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/switchbridge/, ''),
      },
      '/switchbridge/ws': {
        target: process.env.VITE_WS_TARGET || 'ws://server:3000',
        ws: true,
        rewrite: (path) => path.replace(/^\/switchbridge/, ''),
      },
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://server:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_WS_TARGET || 'ws://server:3000',
        ws: true,
      },
    },
  },
});
