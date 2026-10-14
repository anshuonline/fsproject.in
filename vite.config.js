import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Guard against unhandled socket ECONNRESET / EPIPE on aborted client fetch requests in Node 22-26
if (typeof process !== 'undefined' && process.on) {
  process.on('uncaughtException', (err) => {
    if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
      return;
    }
    console.error('Dev server uncaught exception:', err);
  });
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) return;
            console.warn('[vite-proxy error]:', err?.message);
          });
        }
      }
    }
  }
});
