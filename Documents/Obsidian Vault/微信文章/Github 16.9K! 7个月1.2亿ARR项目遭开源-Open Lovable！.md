---
title: "Github 16.9K! 7个月1.2亿ARR项目遭开源-Open Lovable！"
source: wechat
url: https://mp.weixin.qq.com/s/juO1_iYFGKipaUwkGQcf0Q
author: AI代码蜂巢x
pub_date: 2025年10月19日 05:57
created: 2026-01-17 22:06
tags: [AI, 编程, 产品]
---

# Github 16.9K! 7个月1.2亿ARR项目遭开源-Open Lovable！

> 作者: AI代码蜂巢x | 发布日期: 2025年10月19日 05:57
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/juO1_iYFGKipaUwkGQcf0Q)

---

代码蜂巢X

探索编程的无限可能

编辑：嘉禾

项目概述

Open Lovable 是 Firecrawl 团队开源的一款对话式 AI 工具：

输入一句自然语言，或直接贴一个网址，它就能在几十秒内把目标页面抓下来、拆成组件、重写成干净的 React / Next.js 代码，并在本地运行。

拿到的是完整 TypeScript 项目，Tailwind 样式、目录结构、依赖全部就绪，直接 npm run dev 即可预览，随后想怎么改都随你。

问题背景
• 产品要快速迭代，但重搭页面太慢；
• 旧官网技术债，想迁移到现代 React 栈；
• 竞品页面好看，想拿来 A/B 测试又怕侵权手写。

过去要么花大量时间手敲代码，要么用闭源 SaaS 却被按量收费、代码不公开。Open Lovable 把抓取-分析-生成-预览整个流程一次性开源，成本只是几枚 API Key 的调用量。

功能亮点
亮点
	
一句话解释

一键克隆	
任意公开网页 → 干净 React 代码

对话迭代	
继续聊天就能改文案、调样式、加组件

多模型支持	
GPT-4o / Claude / Gemini / Groq-Kimi 随心切

本地沙箱	
E2B 安全运行生成的代码，5 分钟即抛即弃

100 % 代码所有权	
MIT 协议，可商用、可二次分发
技术细节
1. 抓取层：Firecrawl 负责把网页内容、样式、图片抓成结构化数据。
2. AI 层：选用的大模型对页面做“理解→拆分→重写”，输出多文件 React 组件。
3. 运行层：E2B 提供一个临时容器，自动 npm install & dev，浏览器实时预览。
4. 输出层：一键下载 .zip 或直接 git push 到你的仓库，CI/CD 无缝衔接。



架构清晰，全是开源工具链，想魔改成 Vue/Svelte 也只是 fork 后改几行 prompt 的事。

安装与使用
# 1. 克隆
git clone https://github.com/firecrawl/open-lovable.git
cd open-lovable
npm install

# 2. 填 key（任选其一 AI 即可）
cp .env.example .env.local
# 编辑 .env.local
# E2B_API_KEY=xxxxx
# FIRECRAWL_API_KEY=xxxxx
# OPENAI_API_KEY=xxxxx   # 或 ANTHROPIC / GEMINI / GROQ

# 3. 启动
npm run dev
# 浏览器打开 http://localhost:3000

打开界面后，只需：

1. 输入目标网址（或直接描述需求）；
2. 等进度条跑完，点 Preview 看效果；
3. 满意后 Download ZIP 或 git clone 到本地继续开发。


应用案例
• 市场同学 早上 10 点看到竞品新落地页，10 点半就拿 clone 下来的 React 版本改完文案给老板演示；
• 前端新人 用它把经典官网转成代码，边跑边学现代组件组织；
• 创业公司 把老旧 JQuery 官网一次性重写 Next.js，两周内上线新版并接入自研后端。
项目地址

GitHub： https://github.com/firecrawl/open-lovable

---
*导入时间: 2026-01-17 22:06:52*
