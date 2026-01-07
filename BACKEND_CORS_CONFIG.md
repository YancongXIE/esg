# 后端 CORS 配置要求

## 问题描述

前端应用部署在 AWS Amplify，域名：`https://main.d1wio8y4yc72y8.amplifyapp.com`

后端 API：`https://esg.rmit-aihub.org.au/dashboard_process`

浏览器阻止了跨域请求，因为后端服务器没有配置允许来自前端域名的 CORS 请求。

## 必需的 CORS 配置

后端服务器需要在响应中添加以下 HTTP 头：

### 必需的响应头

```
Access-Control-Allow-Origin: https://main.d1wio8y4yc72y8.amplifyapp.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### 如果需要支持多个域名

如果后端需要支持多个前端域名（开发、测试、生产），可以：

1. **动态设置**：根据请求的 `Origin` 头动态设置 `Access-Control-Allow-Origin`
2. **使用通配符**：`Access-Control-Allow-Origin: *`（不推荐用于生产环境，且不能与 `credentials: true` 一起使用）

## 后端配置示例

### Node.js/Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// 方式 1: 使用 cors 中间件（推荐）
app.use(cors({
  origin: [
    'https://main.d1wio8y4yc72y8.amplifyapp.com', // 生产环境
    'http://localhost:5173', // 开发环境（可选）
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// 方式 2: 手动设置响应头
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://main.d1wio8y4yc72y8.amplifyapp.com',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API 路由
app.post('/dashboard_process', (req, res) => {
  // ... 你的处理逻辑
  res.json({ statusCode: 200, results: {...} });
});
```

### Python/Flask

```python
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)

# 方式 1: 使用 flask-cors（推荐）
CORS(app, resources={
    r"/dashboard_process": {
        "origins": [
            "https://main.d1wio8y4yc72y8.amplifyapp.com",
            "http://localhost:5173"  # 可选
        ],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# 方式 2: 手动设置响应头
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins = [
        'https://main.d1wio8y4yc72y8.amplifyapp.com',
        'http://localhost:5173'
    ]
    
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

@app.route('/dashboard_process', methods=['POST', 'OPTIONS'])
def dashboard_process():
    if request.method == 'OPTIONS':
        return '', 200
    
    # ... 你的处理逻辑
    return jsonify({'statusCode': 200, 'results': {...}})
```

### Python/FastAPI

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://main.d1wio8y4yc72y8.amplifyapp.com",
        "http://localhost:5173"  # 可选
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.post("/dashboard_process")
async def dashboard_process():
    # ... 你的处理逻辑
    return {"statusCode": 200, "results": {...}}
```

### Nginx (如果使用反向代理)

```nginx
server {
    listen 443 ssl;
    server_name esg.rmit-aihub.org.au;

    location /dashboard_process {
        # 设置 CORS 头
        add_header 'Access-Control-Allow-Origin' 'https://main.d1wio8y4yc72y8.amplifyapp.com' always;
        add_header 'Access-Control-Allow-Methods' 'POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
        add_header 'Access-Control-Max-Age' '86400' always;

        # 处理预检请求
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://main.d1wio8y4yc72y8.amplifyapp.com' always;
            add_header 'Access-Control-Allow-Methods' 'POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            add_header 'Content-Length' '0';
            return 204;
        }

        # 代理到后端应用
        proxy_pass http://backend_server;
    }
}
```

## 测试 CORS 配置

### 使用 curl 测试

```bash
# 测试预检请求
curl -X OPTIONS https://esg.rmit-aihub.org.au/dashboard_process \
  -H "Origin: https://main.d1wio8y4yc72y8.amplifyapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

查看响应中是否包含 `Access-Control-Allow-Origin` 头。

### 使用浏览器测试

在浏览器控制台（从你的前端应用页面）运行：

```javascript
fetch('https://esg.rmit-aihub.org.au/dashboard_process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pdf_base64: 'test',
    standards: ['gri']
  })
})
.then(response => {
  console.log('✅ CORS 配置成功！状态码:', response.status);
  return response.json();
})
.then(data => console.log('响应:', data))
.catch(error => {
  console.error('❌ CORS 错误:', error);
  console.error('请检查后端 CORS 配置');
});
```

## 联系后端团队

请向后端团队提供以下信息：

### 必需信息

1. **前端域名**：`https://main.d1wio8y4yc72y8.amplifyapp.com`
2. **后端 API 端点**：`https://esg.rmit-aihub.org.au/dashboard_process`
3. **必需的 CORS 响应头**：
   ```
   Access-Control-Allow-Origin: https://main.d1wio8y4yc72y8.amplifyapp.com
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   Access-Control-Max-Age: 86400
   ```
4. **错误信息**：浏览器控制台中的完整 CORS 错误消息

### 测试结果

- ✅ Python 代码可以成功访问 API（说明后端服务器正常运行）
- ❌ 浏览器应用收到 CORS 错误（说明需要配置 CORS）

## 重要提示

1. **预检请求**：浏览器在发送跨域 POST 请求前会先发送 OPTIONS 请求，后端必须正确处理 OPTIONS 请求
2. **响应头必须匹配**：`Access-Control-Allow-Origin` 必须与请求的 `Origin` 头匹配（或使用 `*`）
3. **生产环境安全**：建议只允许特定的前端域名，不要使用 `*` 通配符

## 配置完成后

后端配置完成后，请：
1. 确认后端服务器已重启并应用新配置
2. 清除浏览器缓存
3. 重新测试前端应用
4. 检查浏览器控制台，确认不再有 CORS 错误


