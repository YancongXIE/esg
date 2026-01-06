// 从 .env 文件读取 VITE_GEMINI_API_KEY 并运行测试
const fs = require('fs');
const path = require('path');

// 读取 .env 文件
const envPath = path.join(__dirname, '.env');
let apiKey = null;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.+)/);
  
  if (match) {
    // 移除引号和空格
    apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
    process.env.VITE_GEMINI_API_KEY = apiKey;
    console.log('✅ 已从 .env 读取 API Key (前10个字符:', apiKey.substring(0, 10) + '...)');
  } else {
    console.error('❌ 在 .env 文件中未找到 VITE_GEMINI_API_KEY');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ 无法读取 .env 文件:', err.message);
  console.error('请确保 .env 文件存在于项目根目录');
  process.exit(1);
}

// 运行测试脚本
require('./test-gemini-api.js');



