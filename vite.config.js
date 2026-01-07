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
      // 前端调用相对路径 `/dashboard_process`，由 Vite 代理到后端服务器
      // 开发环境使用代理可以避免 CORS 问题
      // 注意：证书主机名为 esg.rmit-aihub.org.au，使用该主机名以避免证书错误
      '/dashboard_process': {
        target: 'https://esg.rmit-aihub.org.au',
        changeOrigin: true,
        secure: true, // 使用证书中的实际主机名，证书验证应该通过
        // 不重写路径，直接转发到 /dashboard_process
      }
    }
  }
});
