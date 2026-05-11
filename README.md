# MedGuide - 导诊导医 AI 助手

基于 Google Gemini AI 的智慧医院导诊系统。它可以帮助患者快速识别挂号科室、查询医院设施路线，并提供基于医疗百科（华佗数据集）的科普问答。

## 核心功能
- **智能导诊**：根据症状描述推荐科室。
- **医院导航**：提供缴费处、检验科等设施的楼层和详细指引。
- **医疗 QA**：集成 `huatuo_encyclopedia_qa` 数据集，无需向量数据库即可进行轻量级 RAG 检索。
- **免责声明**：所有医学回复均附带合规的免责声明。

## 技术栈
- **前端**：React 19 + TypeScript + Vite
- **UI & 动画**：Tailwind CSS + Motion + Lucide Icons
- **AI 模型**：MiniMax-Text-01 (via OpenRouter)
- **检索增强 (RAG)**：基于本地 JSON (`datasets.json`) 的关键词加权匹配算法。

## 开始运行

### 1. 获取 API Key
访问 [OpenRouter](https://openrouter.ai/) 获取 API Key，并确保你的账户有权限访问 `minimax/minimax-01`。

### 2. 配置环境变量
在项目根目录创建 `.env` 文件：
```env
MINIMAX_API_KEY="YOUR_OPENROUTER_API_KEY"
```

### 3. 安装并启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 数据集说明
本项目在 `src/data/datasets.json` 中采用了 `huatuo_encyclopedia_qa` 的精简版数据。为了支持轻量级运行，系统采用了一种基于关键词命中的检索算法替代了繁重的向量数据库，适合部署在低算力环境下。

---
*免责声明：本项目仅供学习和科普参考，不代表专业医疗诊断意见。*
