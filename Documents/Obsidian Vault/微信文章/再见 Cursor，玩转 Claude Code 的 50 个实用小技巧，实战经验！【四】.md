---
title: "再见 Cursor，玩转 Claude Code 的 50 个实用小技巧，实战经验！【四】"
source: wechat
url: https://mp.weixin.qq.com/s/C-j6Mmp3z8sANkgmMhZwTg
author: 泽安的AI编程
pub_date: 2025年9月25日 20:00
created: 2026-01-17 22:27
tags: [AI, 编程, 产品]
---

# 再见 Cursor，玩转 Claude Code 的 50 个实用小技巧，实战经验！【四】

> 作者: 泽安的AI编程 | 发布日期: 2025年9月25日 20:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/C-j6Mmp3z8sANkgmMhZwTg)

---

大家好，我是泽安！见字如面～




这是泽安的第八篇文章，欢迎帮我点点关注！泽安继续给您带来 Claude Code 的保姆级的实践教程







通过前面的三篇文章，泽安带大家啃完了 Claude 官方教程的干货！链接直达：

再见Cursor，玩转Claude Code 的50个实用小技巧，效率拉满！

再见Cursor，玩转Claude Code 的50个实用小技巧，效率拉满！【二】

再见 Cursor，玩转 Claude Code 的 50 个实用小技巧，效率拉满！【三】




但说实话，真正的使用起来，发现仅仅会官方的指令是完全不够的，不绕弯子，泽安把自己在真实项目里踩过的坑、熬秃头才总结出的“效率秘籍”，一次性打包给你。




这些技巧，没有一句废话，目的只有一个：让你的开发效率，肉眼可见地飙升，让你的代码写得比别人快，bug 还比别人少。




本篇文章较长，全部是实战干货，耐心看完！码字不易，泽安别无他求，来给泽安三连+关注！




一。 Claude.md

这个是必须要搞的，有了它事半功倍，我一般在做项目或者写需求的时候，先在根目录建一个 Claude.md，我会和 AI 【GPT5/grok/deepseek】沟通我的想法，并且选择一个最优的初始的 Claude 的文档




Claude.md 一般可以包含哪些内容：

• 记录技术栈、架构、文件结构、编码规范、常用命令，UI 要求。

• Claude 一旦熟悉你的“项目背景”，出代码的命中率直接翻倍！




提示词可参考：

## 1. 背景
帮我设计并开发一个“个人 Web 站点”，核心定位是  
“文章创作 → 多端同步 → 智能成片 → 静态站点 → 浏览器插件 → 免费+付费模块” 的闭环工作台。

## 2. 技术栈（锁定版本）
| 端   | 技术选型                              | 版本锁定 |
|------|---------------------------------------|----------|
| 前端 | React + TypeScript + Tailwind CSS     | 18 / 5.3 / 3.4 |
| 后端 | Python + Flask + MySQL                | 3.10 / 2.x / 8.0 |
| 测试 | Jest + React Testing Library          | 29 / 13 |

## 3. 一键命令（npm scripts 约定）
```json
{
"dev": "concurrently \"npm run dev:front\" \"npm run dev:back\"",
"dev:front": "cd frontend && npm run dev",
"dev:back": "cd backend && flask run",
"test": "npm run test:unit",
"test:unit": "cd frontend && npm test -- --watchAll=false --passWithNoTests",
"test:full": "cd frontend && npm test -- --watchAll=false --coverage"
}
```
> 要求：优先跑单测（test:unit），通过后再决定是否跑全量（test:full）。

## 4. 编码规范（直接复用官方标准）
- React：官方推荐 + Airbnb 风格，强制 TypeScript 严格模式  
- Python：PEP8 + Black 格式化 + isort 排序，Flask 项目层级按“蓝图+服务+模型”拆分

## 5. 功能需求（用关键词可正则提取）

| 关键词        | 需求描述（验收标准） |
|---------------|----------------------|
| ARTICLE_CRUD  | 后台 Markdown 文章发布、标签、草稿、预览、删除、永久链接 |
| SYNC_ZH       | 一键同步到知乎（OAuth2 + 知乎文章 API） |
| SYNC_MP       | 一键同步到微信公众号（草稿箱→发布，使用官方素材接口） |
| SYNC_JUEJIN   | 一键同步到掘金（Cookie 登录+掘金文章 API） |
| SYNC_CSDN     | 一键同步到 CSDN（Cookie 登录+CSDN 文章 API） |
| AUTO_VIDEO    | 一键生成视频：调用“智能体”API（文本→语音→画面→合成 MP4），可配置横竖版 |
| STATIC_SITE   | 一键构建静态站点（Next.js SSG 或 VitePress），自动部署到 GitHub Pages |
| BROWSER_EXT   | 浏览器插件：划词收藏、稍后读、一键剪藏到后台草稿 |
| FREE_MODULE   | 免费模块：用户注册即可用（ARTICLE_CRUD + STATIC_SITE） |
| PAY_MODULE    | 付费模块：SYNC_* + AUTO_VIDEO + BROWSER_EXT，按月订阅；支付方式是“加泽安微信发激活码” |

## 6. 付费与鉴权流程
1. 前端识别功能码 → 调用 `/api/license/verify`  
2. 后端校验激活码（表结构：code / expire_at / module_mask）  
3. 过期或无码则弹窗提示“联系微信：zeanXXXX”并复制微信号到剪贴板

## 7. 交付顺序（MVP → 迭代）
M1：ARTICLE_CRUD + FREE_MODULE  
M2：SYNC_ZH & SYNC_JUEJIN  
M3：AUTO_VIDEO  
M4：STATIC_SITE + BROWSER_EXT  
M5：SYNC_MP & SYNC_CSDN + PAY_MODULE




二。 把需求说的具体点【完】

也可以说 与 AI 的沟通力，告诉 AI 目标，你的输入，输出，限制条件等等，让 AI 明确具体的任务

例子：

🌅

你不要说 “请修复这个 bug”！ 你不能让 AI 猜测




你要说“请你修复前端的后台工具分类模块的 CSP 字体加载的 bug”

三。 复杂需求学会拆解

我们在做一个大型的项目，先把初始提示词喂给他，然后进行分步骤拆解，每次的拆解要把握一个原则，可以生成一个 demo 让你确认，防止跑偏即可

Claude Code 开发完成后，我们告诉 Claude 我们的系统，直接让它来帮安装依赖即可

尽快他会报一些错，但是他会自己解决的，无需手动干预，依赖自动安装完成后，提示还有数据库

继续让 Claude Code 来打工，让他帮我们安装 mysql 和初始化数据

这样我们就安装完成了，直接让他初始化脚本

手动启动，看看我们的页面：

前端：

后端：

四。 读图写需求

原始图如下，我们直接把原始的图片直接拖到 Claude Code 命令框即可

图片+讲清楚的需求，这样 Claude Code 工作的更好

我们稍事等待下，就开发完成了，如下：

查看下最终效果：




五。 选择 AI 擅长的




AI 现在确实越来越强，但是 AI 也是和人一样，他也有短板，在同一个问题上，我们尽量让它使用自己擅长的！




我使用 Claude Code 开发的这一个月：

前端我发现它对 Vue 的前端框架不太优化，但是改 React 就很不错，前端选型尽量就用 react；

后端我发现 AI 写 go 就有点费劲，但是我使用下来对 python 支持还挺好，所以后端选型建议用 python；




六。 ultrahink

在 Claude Code 里，ultrathink 就是“加钱上满血”开关。

把它写在提示词里，系统就给 Claude 分配最多 32 k token 的“思考预算”，让它先反复推理、再动手写代码；质量最高，账单也最贵。一句话：

ultrathink = 深度思考 + 顶配算力 + 钱包警告




这个命令国内的代理不一定能够支持哦！




七。 引导 AI 自己思考

在我的使用过程中，有的时候发现一个问题反复修改一个问题，就是改不出来想先要的效果，我一般会这么告诉 AI，亲测非常有效！

我的需求是xxxx，我期望达到的效果是xxx，请你从xxx角度仔细想一想，实现的流程步骤去实施！




八。 换一个模型




在我的使用过程中，有的时候发现一个问题反复修改一个问题，就是改不出来想先要的效果！




这种情况下一般换一个模型去尝试下，很大概率可以一次解决，我们直接使用 claude code 里面更新下文件就好了，如下：

文章链接：太全了！Claude Code 一键接入国产四大模型: DeepSeek、GLM、Qwen、Kimi 超全攻略！




九。 在合适的时机手动 compact

之前我介绍了 compact，但是这里也不能瞎用！最好也不要让 claude code 自动的 compact！




一般用于某一个模块，某一个功能开发完成的时候，我们进行压缩下！




十。 测试驱动开发




是防止 AI“自由发挥”的最强手段。让 AI 在一开始就知道自己的目的，可以减少与 AI 周旋拉扯的时间。然而 AI 显然在写测试这方面，显然比业务代码更强。




测试用例为 AI 提供了一个清晰、客观、唯一、容易执行的完成标准。让 AI 有了使命感一样，它的所有代码修改都必须为了“让测试变绿”，极大地约束了其行为，从而可以保证代码质量。




十一。 接手祖传代码应该如何玩




先使用/init 生成 claude.md 是必然的！在我们的实际开发过程中，应该是小步迭代 还是 一步到位呢？




所谓的小步快跑：每次只让 AI 完成一个小功能，完成后再进行下一次任务的开发

一步到位：直接把整个需求扔给 AI，让它一次性生成所有代码，直接开启--dangerously-skip-permissions 模式




这两种模式我都深度使用过，如果你做的是新项目，小产品，我建议是用一步到位的方法；但是如果是接手的祖传代码的话，就使用小步快跑的模式；




小步快跑的模式，可控性高，开发者能够看到改了那些，质量也可以得到保证

写在最后

在使用 claude code 开发的过程中，几点思考，分享给大家：




第一个阶段：之前的 AI Coding 是以我为主，AI 为辅，人要准备好提示词，学会 PUA，凶 AI；

第二个阶段：AI 为主，我为辅，现在前言的人是这种想法，也就是 vibe coding，给 AI 说这个错了，报错粘贴给他，让 AI 修复；

第三个阶段：人+AI 核心是"+"，修炼的是「协作共创」能力。让 AI 懂人，人驱动 AI




现在你使用 AI 在哪一个阶段？




我新建了一个 AI 编程商业化群，不仅可以围观泽安复利商业化路径，而且还有很多干货分享，限免进群




>/ 作者：泽安

本篇文章4000+字，码字不易，能看到这里的都是真爱！

如果觉得不错，随手点个赞、小心心、转发，评论四连吧~

如果想第一时间收到推送，加上关注，给我个星标⭐

谢谢你耐心看完我的文章~

---
*导入时间: 2026-01-17 22:27:55*
