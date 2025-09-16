import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    rollupOptions: {
      external: (id) => {
        // Externalize Node.js modules that shouldn't be bundled for browser
        if (id.includes('jsdom') || id.includes('cssstyle') || id.includes('agent-base')) {
          return true;
        }
        return false;
      }
    }
  },
  server: {
    proxy: {
      // Proxy for AASB news
      '/api/aasb': {
        target: 'https://www.aasb.gov.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aasb/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy for ESG Today news
      '/api/esgtoday': {
        target: 'https://www.esgtoday.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/esgtoday/, ''),
      }
    }
  }
});
