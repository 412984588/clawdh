---
title: "【AI项目】这个开源AI工具又更新了，文字、语音、视频、图片全搞定，还支持一键部署，开箱即用"
source: wechat
url: https://mp.weixin.qq.com/s/E7pjYdkTWuq1_m85N_eYzQ
author: 源代码哥
pub_date: 2025年10月11日 21:33
created: 2026-01-17 22:25
tags: [AI, 编程]
---

# 【AI项目】这个开源AI工具又更新了，文字、语音、视频、图片全搞定，还支持一键部署，开箱即用

> 作者: 源代码哥 | 发布日期: 2025年10月11日 21:33
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/E7pjYdkTWuq1_m85N_eYzQ)

---

大家好，我是 源代码哥 👋。

今天在github上发现这个超实用的AI开源项目（chatgpt-web-midjourney-proxy）又更新了，新增了支持sora-2。
如果你既想玩 ChatGPT，又想用 Midjourney 画图，但不想折腾命令行和 API 接口，这个项目绝对是你的福音！

它把 ChatGPT 与 Midjourney 两大 AI 工具完美整合进一个漂亮的网页应用，让你直接在浏览器中完成对话、绘图、任务管理等操作。

一句话总结：这是一个开箱即用的 AI 聊天 + 绘画中控台。

✨ 应用特性

支持 ChatGPT & Midjourney 双引擎：不仅能和 ChatGPT 聊天，还能调用 Midjourney 生成 AI 绘图，文字与图像一体化体验。

可自建 API 代理：支持自定义 OpenAI 接口和 Midjourney Proxy，无需担心被封号或流量问题，更安全稳定。

多模型支持（GPT-3.5、GPT-4、Claude、Gemini等）：后端支持多种 AI 模型，配置灵活，前端界面可以自由切换。

Web 全界面交互体验：提供类似 ChatGPT 官方网页的聊天 UI，支持多会话、多主题、图片预览、任务追踪等功能。

Midjourney 任务管理面板：绘图任务可视化展示，实时查看生成进度，还能查看历史图片、重新生成等操作。

多用户支持 + 权限控制：可部署为多人使用系统，支持账号注册、登录、额度管理，非常适合团队使用。

支持 Docker 一键部署：提供完整的 Docker 配置文件，几分钟即可搭建属于你自己的 AI 平台。

🧩 应用技术栈
PC 前端

框架：Vue 3 + TypeScript

后端

语言：Node.js (Express)

代理服务：可配置 OpenAI API、Midjourney Proxy

部署方式：Docker Compose / PM2

数据库（可选）：Redis（用于任务缓存、用户状态等）

这套组合在性能和易用性上都非常平衡，前后端完全分离，适合二次开发或私有化部署。

🖼 应用相关截图
⚙ 部署教程

下面我帮你总结一个超级简单的部署方式👇

1、准备环境

Node.js >= 18
Docker / Docker Compose（推荐）
一台支持外网访问的服务器（例如 AWS、阿里云）

2、克隆项目代码

git clone https://github.com/Dooy/chatgpt-web-midjourney-proxy.git
cd chatgpt-web-midjourney-proxy

3、配置环境变量

编辑 .env 文件，填入你的 OpenAI Key、Midjourney Proxy 地址：

OPENAI_API_KEY=sk-xxxxxx
MJ_PROXY_URL=https://your-mj-proxy.com
PORT=3000

4、Docker 一键部署

docker compose up -d

5、访问系统

部署成功后，浏览器访问 http://your-server-ip:3000，
你就能看到熟悉的 ChatGPT 聊天界面 + Midjourney 图片生成功能啦！
🎯 推荐原因

这个项目的核心价值在于 集成性 + 可私有化部署。 如果你满足以下任意一条，这项目你都值得收藏👇

想要搭建自己的 ChatGPT + Midjourney 网页版；

不想被官方封号、限速；

想为团队提供一个统一的 AI 助手平台；

想二次开发自己的 AI 平台；

想用 Docker 快速搭建一个 AI 工具中心。

而且开发者 Dooy 更新频繁，社区也比较活跃，遇到问题基本都能找到解决方案。

🔗 应用相关链接
链接名称
	
链接地址


GitHub 项目地址
	https://github.com/Dooy/chatgpt-web-midjourney-proxy

演示站点
	https://vercel.ddaiai.com

📢 关注我，获取更多有趣的开源项目

---
*导入时间: 2026-01-17 22:25:49*
