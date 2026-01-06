// 简单的 Gemini API 测试脚本（Node 环境）
// 用来单独验证当前 API Key 和模型是否可用
//
// 使用方式：
// 1. 在终端设置环境变量（推荐）：
//    export GEMINI_API_KEY="AIza...你的Key..."
// 2. 在项目根目录运行：
//    node test-gemini-api.js
//
// 也可以通过命令行参数传入模型名，例如：
//    node test-gemini-api.js gemini-2.0-flash

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// 从环境变量读取 API Key（支持 GEMINI_API_KEY 和 VITE_GEMINI_API_KEY）
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// 默认模型名，可通过命令行参数覆盖
const defaultModel = "gemini-2.0-flash";
const model = process.argv[2] || defaultModel;

if (!apiKey) {
  console.error(
    "❌ 未找到 API Key 环境变量。\n\n" +
    "请使用以下方式之一设置：\n" +
    "  1. export GEMINI_API_KEY=\"AIza...你的Key...\"\n" +
    "  2. export VITE_GEMINI_API_KEY=\"AIza...你的Key...\"\n" +
    "  3. 或者使用 dotenv 加载 .env 文件：\n" +
    "     npx dotenv -e .env -- node test-gemini-api.js"
  );
  process.exit(1);
}

console.log("========================================");
console.log("🔍 Gemini API 测试");
console.log("========================================");
console.log("使用模型:", model);
console.log("API 地址:", `${GEMINI_API_URL}/${model}:generateContent`);
console.log("========================================");

async function testGemini() {
  try {
    const prompt =
      "Test message: Please reply with a short English sentence confirming that the Gemini API is working.";

    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 64,
        },
      }),
    });

    console.log("HTTP 状态码:", response.status, response.statusText || "");

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("⚠️ 无法解析为 JSON，原始返回文本：");
      console.log(text);
      return;
    }

    if (!response.ok) {
      console.error("❌ 调用失败，错误详情：");
      console.dir(data, { depth: null });
      return;
    }

    console.log("✅ 调用成功，部分返回内容：");
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      console.log("模型回复:\n", data.candidates[0].content.parts[0].text);
    } else {
      console.dir(data, { depth: null });
    }
  } catch (err) {
    console.error("❌ 请求异常:", err);
  }
}

testGemini();


