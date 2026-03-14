---
title: "一键透视网站内幕：Web-Check，你的全能开源情报分析工具"
source: wechat
url: https://mp.weixin.qq.com/s/7jWEIZ1L0j9FQrhUclAy7Q
author: HeyAI人工智能
pub_date: 2026年1月13日 01:10
created: 2026-01-17 20:11
tags: [AI, 编程]
---

# 一键透视网站内幕：Web-Check，你的全能开源情报分析工具

> 作者: HeyAI人工智能 | 发布日期: 2026年1月13日 01:10
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/7jWEIZ1L0j9FQrhUclAy7Q)

---

🌈

HeyAI人工智能 每天 1 分钟 · 掌握最实用的 AI 技巧与工具

1️⃣ 项目概览

Web-Check 是一款功能强大的开源情报（OSINT）工具，旨在为任何网站提供全面、按需的分析。它能够深入洞察目标网站的运作机制，揭示潜在的攻击向量、分析服务器架构、查看安全配置，并识别网站所使用的技术栈。

其核心目标是帮助开发者、安全研究人员和网站管理员轻松理解、优化并保护自己的网站。通过一个简洁的仪表板，你可以一站式获取超过30种关键信息，无需在不同工具间切换。

关键功能概括：

基础设施分析：IP信息、SSL证书链、DNS记录、服务器位置与信息。
安全配置审计：HTTP安全头、Cookie策略、防火墙检测、TLS安全配置、开放端口扫描。
技术与架构洞察：技术栈识别、网站性能与质量指标、关联主机名、重定向链、站点地图。
威胁与合规检查：恶意软件与钓鱼检测、全局排名、存档历史、安全策略文件（如security.txt）。
2️⃣ 核心能力与技术亮点
⚡ 核心技术点
全栈技术栈：基于现代Web技术构建，前端使用React，后端Node.js，提供RESTful API。
模块化检查引擎：每个分析任务（如DNS查询、SSL检查）都是独立的模块，易于扩展和维护。
集成外部API：可配置集成Google Lighthouse、Shodan、WhoAPI等服务，以获取更深入的数据（需API密钥）。
🧠 架构 / 原理说明

Web-Check 采用客户端-服务器架构。用户在前端界面输入目标URL，请求被发送到后端API。后端并行发起一系列网络请求和分析任务，包括：

基础网络查询：通过系统调用或库（如dns.lookup）获取IP、DNS记录。
HTTP交互分析：获取HTTP响应头、Cookie、重定向链。
安全与配置扫描：使用特定算法和规则集（如检查HSTS头、CSP策略）评估安全状况。
外部服务集成：将数据发送给配置的外部服务（如用于质量指标的Google Lighthouse）并聚合结果。 所有结果被收集、格式化，并通过统一的JSON响应返回给前端仪表板进行可视化展示。
🔐 性能 / 安全 / 优化亮点
隐私友好：所有分析默认在用户自己的服务器或部署环境中运行，数据不经过第三方。
可配置性与扩展性：通过环境变量轻松启用/禁用功能、集成API、调整超时和速率限制。
多部署选项：支持Netlify、Vercel一键部署，Docker容器化，以及从源码构建，适应不同环境需求。
轻量且高效：检查任务并行执行，优化了整体分析时间。
3️⃣ 快速上手指南

Web-Check 提供了多种便捷的部署方式，以下是两种最快速的启动方法：

方案一：使用Docker（最快）

如果你的环境已安装Docker，只需一行命令：

docker run -p 3000:3000 lissy93/web-check


执行后，在浏览器中打开 http://localhost:3000 即可开始使用。

方案二：从源码部署（灵活定制）
克隆仓库：



git clone https://github.com/Lissy93/web-check.git[1]    2. **进入目录并安装依赖**： bash cd web-check yarn install    3. **构建并启动生产服务**： bash yarn build yarn serve    ``` 4.  访问 http://localhost:3000。

环境要求：Node.js (v18.16.1+), yarn, git。部分深度检查（如截图、路由追踪）需要系统安装chromium、traceroute等工具，非必需。

4️⃣ 示例 / 使用场景

假设你是一名安全研究员，需要对 example.com 进行初步评估。

输入：在Web-Check的输入框中填入 https://example.com 并点击分析。

输出与洞察（部分示例）：

🔍 IP与服务器信息

IP地址：93.184.216.34
服务器位置：美国，马萨诸塞州（可在地图上查看）
托管提供商：识别出主要的CDN或云服务商。

🛡️ 安全配置检查

SSL证书：显示颁发机构、有效期、证书链完整性。
HTTP安全头：检查HSTS、CSP、X-Frame-Options等是否配置正确并给出评级。
TLS配置：列出支持的加密套件，并依据Mozilla指南评估其安全性（现代、中等、过时）。

🧩 技术栈识别

前端框架：可能检测到React、Vue.js的痕迹。
服务器软件：识别出Nginx或Apache版本。
分析工具：发现Google Analytics、Hotjar等跟踪器。

📈 性能与SEO

Lighthouse评分：展示性能、可访问性、最佳实践、SEO四个维度的分数（需配置Google API密钥）。
页面结构：列出从sitemap.xml和robots.txt中发现的公开页面和爬虫规则。

⚠️ 威胁情报

黑名单检查：快速查询该域名是否出现在URLHaus、PhishTank等恶意软件或钓鱼网站列表中。

通过以上聚合信息，你可以在几分钟内对目标网站的技术轮廓、安全状况和网络足迹有一个全面了解，而无需手动运行十几种不同的工具。

5️⃣ 项目地址与文档
https://github.com/Lissy93/web-check

🌈

关注公众号：HeyAI人工智能 每天更新 AI 实用干货

引用链接

[1]
https://github.com/Lissy93/web-check.git

---
*导入时间: 2026-01-17 20:11:45*
