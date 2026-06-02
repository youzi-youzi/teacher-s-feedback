const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 让 Express 能够提供根目录下的静态文件，如 index.html
app.use(express.static(__dirname));

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

app.post('/api/polish', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'missing prompt' });
    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-max",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });
        res.json({ result: completion.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 本地开发时（直接运行 node server.js），启动监听
if (require.main === module) {
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
} else {
    // Vercel 部署时，导出 app 实例
    module.exports = app;
}