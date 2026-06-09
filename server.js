const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config(); // 有 .env 就加载，没有也不影响

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 完全开放的 CORS 配置（无需 .env）====================
// 注意：关闭 credentials，允许所有来源，这样任何前端都可以调用你的 API
app.use(cors({
    origin: '*',                        // 允许所有域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 预检请求直接响应
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// ==================== 中间件 ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==================== OpenAI 配置 ====================
// 注意：必须保证环境变量 DASHSCOPE_API_KEY 存在（可通过系统环境或部署平台设置）
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
        console.log(`CORS: 允许所有来源，无需 .env 配置`);
    });
} else {
    module.exports = app;
}