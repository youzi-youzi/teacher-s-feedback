const express = require('express');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 最强制 CORS（手动设置，确保万无一失） ====================
app.use((req, res, next) => {
  // 允许任何来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  // 允许的请求方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  // 预检请求直接返回 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ==================== 中间件 ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==================== OpenAI 配置 ====================
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// ==================== 路由 ====================
app.post('/api/polish', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'missing prompt' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "qwen-max",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.json({
      result: completion.choices[0].message.content
    });
  } catch (err) {
    console.error('OpenAI Error:', err);
    res.status(500).json({
      error: err.message || '服务器内部错误'
    });
  }
});

// ==================== 启动 ====================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}
module.exports = app;