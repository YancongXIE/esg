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
      },
      // Proxy for ESG Today news
      '/api/esgtoday': {
        target: 'https://www.esgtoday.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/esgtoday/, ''),
      },
      // Proxy for ESG dashboard backend (PDF processing)
      // 前端调用相对路径 `/dashboard_process`，由 Vite 代理到后端 IP
      '/dashboard_process': {
        target: 'https://3.24.35.11',
        changeOrigin: true,
        secure: false, // 接受自签名证书，仅用于开发环境
      }
    }
  }
});
