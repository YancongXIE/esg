// 测试 Gemini API Key
// 使用方法：
//   1. 从环境变量读取：export VITE_GEMINI_API_KEY="your-key" && node test-api-key.js
//   2. 从 .env 文件读取：node test-api-key.js
//   3. 直接传入：node test-api-key.js "your-api-key"

const fs = require('fs');
const path = require('path');

// 获取 API Key 的多种方式
function getApiKey() {
  // 方式1: 命令行参数
  if (process.argv[2]) {
    return process.argv[2];
  }
  
  // 方式2: 环境变量
  if (process.env.VITE_GEMINI_API_KEY) {
    return process.env.VITE_GEMINI_API_KEY;
  }
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // 方式3: 从 .env 文件读取
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.+)/);
      if (match) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (err) {
    // 忽略文件读取错误
  }
  
  return null;
}

const apiKey = getApiKey();

if (!apiKey) {
  console.error('❌ 未找到 API Key');
  console.error('\n请使用以下方式之一提供 API Key:');
  console.error('  1. 环境变量: export VITE_GEMINI_API_KEY="your-key" && node test-api-key.js');
  console.error('  2. 命令行参数: node test-api-key.js "your-key"');
  console.error('  3. .env 文件: 在项目根目录创建 .env 文件，添加 VITE_GEMINI_API_KEY=your-key');
  process.exit(1);
}

// 验证 API Key 格式
if (!apiKey.startsWith('AIza')) {
  console.error('❌ API Key 格式不正确，应该以 "AIza" 开头');
  process.exit(1);
}

console.log('========================================');
console.log('🔍 测试 Gemini API Key');
console.log('========================================');
console.log('API Key (前10字符):', apiKey.substring(0, 10) + '...');
console.log('API Key 长度:', apiKey.length);
console.log('========================================\n');

async function testApiKey() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "API key is working" if you can read this.'
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 50,
        }
      })
    });

    console.log('HTTP 状态码:', response.status, response.statusText);
    console.log('');

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ 无法解析响应为 JSON');
      console.error('原始响应:', text.substring(0, 500));
      return;
    }

    if (!response.ok) {
      console.error('❌ API 调用失败');
      console.error('');
      
      if (response.status === 403) {
        const errorMsg = data.error?.message || '';
        console.error('403 Forbidden 错误详情:');
        
        if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key')) {
          console.error('  → API Key 无效或已过期');
          console.error('  → 请检查 API Key 是否正确，或创建新的 API Key');
        } else if (errorMsg.includes('quota') || errorMsg.includes('Quota')) {
          console.error('  → API 配额已用完');
          console.error('  → 请启用账单或等待配额重置');
        } else if (errorMsg.includes('billing') || errorMsg.includes('Billing')) {
          console.error('  → 账单未启用');
          console.error('  → 请在 Google Cloud 项目中启用账单');
        } else {
          console.error('  → 错误消息:', errorMsg);
        }
      } else {
        console.error('错误详情:', JSON.stringify(data, null, 2));
      }
      return;
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('✅ API Key 测试成功！');
      console.log('');
      console.log('模型回复:', responseText);
      console.log('');
      console.log('✅ API Key 有效，可以正常使用');
    } else {
      console.error('❌ 响应格式异常');
      console.error('响应数据:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ 请求异常:', err.message);
    if (err.message.includes('fetch')) {
      console.error('提示: 请确保网络连接正常');
    }
  }
}

testApiKey();


