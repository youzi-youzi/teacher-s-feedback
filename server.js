const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 标准 CORS 配置（允许所有来源）
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));  // 提供静态文件（如 index.html）

// OpenAI 配置（使用阿里云 DashScope）
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// API 路由
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

        res.json({ result: completion.choices[0].message.content });
    } catch (err) {
        console.error('OpenAI Error:', err);
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});

// 启动服务器
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;   // 保留这一行，用于 Vercel 部署（Vercel 完全支持 CommonJS）