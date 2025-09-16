# CORS扩展设置指南

## 开发环境解决方案

### 1. 安装CORS扩展
- Chrome: "CORS Unblock" 或 "CORS Toggle"
- Firefox: "CORS Everywhere"
- Edge: "CORS Unblock"

### 2. 启用扩展
- 在开发环境中启用扩展
- 确保扩展允许您的域名访问外部API

### 3. 注意事项
- 仅用于开发环境
- 生产环境需要其他解决方案
- 可能影响其他网站的安全性

## 替代方案

### 1. 使用本地代理服务器
```bash
# 安装cors-anywhere
npm install -g cors-anywhere

# 启动本地代理
cors-anywhere
```

### 2. 使用Vite代理配置
在vite.config.js中配置代理：
```javascript
export default {
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://www.aasb.gov.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '')
      }
    }
  }
}
```
