const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 打印环境变量状态（调试用）
console.log('=== 环境变量检查 ===');
console.log('DASHSCOPE_API_KEY 是否存在:', !!process.env.DASHSCOPE_API_KEY);
if (process.env.DASHSCOPE_API_KEY) {
    console.log('DASHSCOPE_API_KEY 前5位:', process.env.DASHSCOPE_API_KEY.substring(0, 5));
} else {
    console.error('❌ 未找到 DASHSCOPE_API_KEY，请检查 .env 文件！');
}
console.log('===================');

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

app.post('/api/polish', async (req, res) => {
    const { prompt } = req.body;
    console.log('收到润色请求，prompt 长度:', prompt?.length || 0);

    if (!prompt) {
        return res.status(400).json({ error: 'missing prompt' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-max",   // 可改为 qwen-plus 或 qwen-turbo
            messages: [
                { role: "system", content: "你是一位温柔专业的小学语文老师。" },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const polished = completion.choices[0].message.content;
        console.log('润色成功，结果长度:', polished.length);
        return res.json({ result: polished });
    } catch (error) {
        console.error('调用 DashScope 失败:');
        console.error('状态码:', error.status);
        console.error('错误信息:', error.message);
        if (error.response) {
            console.error('响应详情:', error.response.data);
        }
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📝 后端已启动，等待前端请求...`);
});