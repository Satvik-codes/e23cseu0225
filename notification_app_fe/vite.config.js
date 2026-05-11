/**
 * vite.config.js — Vite configuration for the campus notification frontend.
 * Dev server runs on port 3000. /api requests are proxied to the backend on port 5000.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
