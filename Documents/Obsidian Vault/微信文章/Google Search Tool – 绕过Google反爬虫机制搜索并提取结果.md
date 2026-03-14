---
title: "Google Search Tool – 绕过Google反爬虫机制搜索并提取结果"
source: wechat
url: https://mp.weixin.qq.com/s/GQrrmIDlibv4l12ewQPcxg
author: 老亨智能体
pub_date: 2025年10月5日 00:00
created: 2026-01-17 22:25
tags: [AI, 编程, 产品]
---

# Google Search Tool – 绕过Google反爬虫机制搜索并提取结果

> 作者: 老亨智能体 | 发布日期: 2025年10月5日 00:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/GQrrmIDlibv4l12ewQPcxg)

---

使用 Google 搜索查找资料，有时候会遇到反爬虫机制拦截，常见需要输入验证码，严重的限制访问， 而 Google Search Tool 这款开源工具可以作为付费的SerpAPI 开源平替，基于 Playwright 实现，智能绕过 Google 的反爬检测，支持浏览器指纹管理、状态保存等功能，还能集成到 AI 助手上使用。通过 npm 安装后可作为命令行工具使用，也可以配置到 Claude Desktop 等支持 MCP 的 AI 助手上使用。

主要功能特点
本地化 SERP API 替代方案
：无需依赖付费的搜索引擎结果 API 服务，完全在本地执行搜索操作
先进的反机器人检测绕过技术
：
智能浏览器指纹管理，模拟真实用户行为
自动保存和恢复浏览器状态，减少验证频率
无头/有头模式智能切换，遇到验证时自动转为有头模式让用户完成验证
多种设备和区域设置随机化，降低被检测风险
原始HTML获取
：能够获取搜索结果页面的原始HTML（已移除CSS和JavaScript），用于分析和调试Google页面结构变化时的提取策略
网页截图功能
：在保存HTML内容的同时，自动捕获并保存完整网页截图
MCP 服务器集成
：为 Claude 等 AI 助手提供实时搜索能力，无需额外 API 密钥
完全开源免费
：所有代码开源，无使用限制，可自由定制和扩展







官方使用说明
安装
# 从源码安装
git clone https://github.com/web-agent-master/google-search.git
cd google-search
# 安装依赖
npm install
# 或使用 yarn
yarn
# 或使用 pnpm
pnpm install

# 编译 TypeScript 代码
npm run build
# 或使用 yarn
yarn build
# 或使用 pnpm
pnpm build

# 将包链接到全局（使用MCP功能必需）
npm link
# 或使用 yarn
yarn link
# 或使用 pnpm
pnpm link
Windows 环境特别说明

在 Windows 环境下，本工具已经做了特殊适配：

提供了 .cmd 文件，确保命令行工具在 Windows 命令提示符和 PowerShell 中正常工作
日志文件存储在系统临时目录，而不是 Unix/Linux 的 /tmp 目录
添加了 Windows 特定的进程信号处理，确保服务器能够正常关闭
使用跨平台的文件路径处理，支持 Windows 的路径分隔符
技术特性
使用 TypeScript 开发，提供类型安全和更好的开发体验
基于 Playwright 实现浏览器自动化，支持多种浏览器引擎
支持命令行参数输入搜索关键词
支持作为 MCP 服务器，为 Claude 等 AI 助手提供搜索能力
返回搜索结果的标题、链接和摘要
支持获取搜索结果页面的原始HTML用于分析
以 JSON 格式输出结果
支持无头模式和有头模式（调试用）
提供详细的日志输出
健壮的错误处理机制
支持保存和恢复浏览器状态，有效避免反机器人检测
获取方式
官方网站

https://github.com/web-agent-master/google-search

那段时间查资料老被验证码和频繁的阻断搞得心态炸裂，翻来覆去总觉得信息被有形的墙挡住了。后来在能不能快点把数据抓到手的纠结里试了 Google Search Tool，结果确实把那些零碎的搜索结果汇成了可用的清单，让我能把时间花在分析而不是搬运上。说实话，最舒服的不是它有多“聪明”，而是那种从被动等待到主动工作的转换感——我可以更快得到线索，去做下一步判断。不过同时我也会格外注意合规和道德边界，信息的获取方式同样重要。对我来说，Google Search Tool 帮我把研究的节奏拉回来，但用它的人最好先想清楚：速度带来的责任，也该一并承担。

---
*导入时间: 2026-01-17 22:25:38*
