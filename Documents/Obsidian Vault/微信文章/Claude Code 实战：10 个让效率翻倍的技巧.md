---
title: "Claude Code 实战：10 个让效率翻倍的技巧"
source: wechat
url: https://mp.weixin.qq.com/s/OKuDg1odMmJtFy0WnO8oWg
author: AI工具进化论
pub_date: 2025年10月28日 09:45
created: 2026-01-17 21:28
tags: [AI, 编程]
---

# Claude Code 实战：10 个让效率翻倍的技巧

> 作者: AI工具进化论 | 发布日期: 2025年10月28日 09:45
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/OKuDg1odMmJtFy0WnO8oWg)

---

用了小半年 Claude Code，我把官方最佳实践和踩过的坑整理成这份指南。10 个技巧，每个都能立即上手。

一、很多人只用到 Claude Code 30% 的能力

我最近发现，很多人用 Claude Code，就像用聊天机器人。

问一句，答一句。改代码，再问，再答。完全没发挥出它的真正能力。

我用 Claude Code 小半年了，做了不少项目：

优化工具网站，通过了 AdSense 验证
把常用脚本变成 Agent Skills，效率直接翻倍
DeepSeek OCR 网站，追到热点
使用自动化 Claude Code 写公众号、做网站 这些项目让我意识到，Claude Code 根本不是个聊天工具。它是一整套编程工作流。

今天分享 10 个实用技巧，都是我日常使用、学习、踩坑总结出来的。不讲虚的理论，只讲能上手就能用的。

二、配置优化：让 Claude 记住你的习惯
技巧 1：CLAUDE.md - 让 Claude 记住你的项目

问题：每次打开 Claude Code，都要重复说明项目结构、常用命令、代码风格。

解决方案：在项目根目录创建 CLAUDE.md 文件，Claude 启动时会自动加载。

创建方式：进入一个项目文件夹后，执行 /init 命令，它就会扫描整个项目文件夹，生成一个 CLAUDE.md 文件。

我的配置示例（从 ben-pathfinder 项目提取）：

# 项目概览
个人作品集网站 - ben-pathfinder

## 技术栈
- React 18 + TypeScript + Vite
- shadcn/ui 组件库
- Tailwind CSS
- Supabase 后端
- Astro 博客子系统（在 /blog 目录）

## 常用命令
npm run dev          # 主站开发
npm run dev:all      # 同时启动主站+博客
cd blog && pnpm dev  # 只启动博客
npm run build        # 生产构建

## 博客发布注意事项（重要！）
- pubDatetime 必须是过去时间，不能是未来（血泪教训）
- 图片必须放在 blog/src/assets/images/
- 引用格式：../../assets/images/xxx.png


效果：我有几十个网站项目，每个项目打开 Claude Code，它自动知道这是什么项目，用什么技术栈。不用每次重复说明，添加功能，修改内容的时候，AI 不容易出错，基本一把梭哈。

技巧 2：权限自动批准 - 告别重复点击

问题：每次 Claude 读文件、写代码、运行命令，都要点「允许」。

解决方案：启动时加参数：claude --dangerously-skip-permissions

更方便的方式 - 在命令行里设置 alias：

alias cc="claude --dangerously-skip-permissions"


以后直接输入 cc 启动。如果不知道上面的代码如何配置，直接启动 cc，让它帮你配置就行。

使用建议：

✅ 个人项目放心用
✅ 熟悉的工作流放心用
❌ 不熟悉的代码谨慎用 ***
技巧 3：自定义 Slash 命令 - 一键触发工作流

问题：每次部署，都要重复说一遍流程。

步骤：

创建 .claude/commands/ 文件夹
创建 部署.md，写入流程：
---
name: 部署到生产环境
description: 自动化 GitHub 和 Vercel 部署流程
---

## 部署步骤
- [ ] Step 1: 运行 `pnpm run build` 检查构建
- [ ] Step 2: 创建 GitHub 私有仓库（可选，已有仓库则跳过创建）
- [ ] Step 3: Push 代码到 GitHub
- [ ] Step 4: 部署到 Vercel
- [ ] Step 5: 验证部署结果

**重要**：只有 build 成功后才能继续

使用：输入 /部署，自动执行

效果：用这个命令部署了十几个网站，基本不会有问题。

技巧 4：Agent Skills - 给 Claude 配技能包

这是我最近发现的杀手级功能。

10 月 16 日，Claude 发布 Agent Skills。我花了两天，把两个常用脚本改造成 Skills。

什么是 Agent Skills：给 Claude 配置「专业技能包」。配置一次，长期使用。

核心设计：渐进式披露，分三层加载

Level 1: 元数据（100 token）- Claude 靠这个判断什么时候用
Level 2: 主指令（<5000 token）- 匹配时才读取
Level 3: 详细资源（无限制）- 按需加载 我的用法：

Google SEO Skill

Google SEO Guide 内容很多，很复杂、细碎，看了也记不住。

所以把 Google 官方文档批量下载下来，制作成 skill，在做新网站，优化网站的时候，让 Claude Code 调用这个 skill 去 review 网站的细节。

获取skill：

官方 12 个 Skills：https://github.com/anthropics/skills
我的开源 Skills：https://github.com/littleben/awesomeAgentskills
精选集：https://agentskills.best
三、效率提升：让每一秒都值得
技巧 5：/clear vs /compact - 上下文管理

Claude Code 有 200K tokens 上下文，但用着用着就满了。

两个命令，不同场景：

/clear - 清空对话
清空所有历史，保留 CLAUDE.md
场景：开始新任务、切换功能模块
最佳实践：结束一个任务之后，不要继续在原对话里提需求，新任务用 /clear。就有点像睡醒以后干活，脑子又快又好使。
/compact - 压缩对话
压缩历史，保留关键信息
场景：上下文快满，但需要保留讨论

一般在解决比较复杂的问题时，CC 搞半天搞不定，可以考虑新开一局，让「新 AI 脑子」来干活。

技巧 6：Plan Mode - 复杂任务先规划

问题：直接让 Claude 做复杂任务，做到一半发现方向错了。

怎么触发：

明确说「先给我一个计划」
或者按几次 Shift+Tab 切换到 Plan 模式，这个模式不会直接写代码，是先做调研和计划，你看完计划后，通过了才开始干活。

我在做新网站，或者增加新功能时，一般都会先开 Plan 模式。

技巧 7：Think Mode - 激活深度思考

问题：有些问题 Claude 第一反应是错的。

四个层级：

think - 基础思考
think hard - 更深入
think harder - 很深入
ultrathink - 最深入

之前是在提示词的开头或结尾添加 think 关键词，就能触发。现在改成了按 Tab 键切换 think on/off，要增加 Think 的级别，还是可以用关键词。

什么时候用：

遇到难题，第一个方案不 work
需要多方案对比
架构设计决策

别滥用：简单任务用 ultrathink 浪费时间，浪费 token。

技巧 8：快捷键与交互技巧

这些小技巧每天能节省几分钟。

核心快捷键：

Shift + 拖拽：引用文件
Escape：停止执行（不是 Ctrl + C）
双击 Escape：查看历史消息
弹出单选、多选之类的表单时，最后 submit 是需要用方向键按右切换，然后按回车提交。

常见误区（我都踩过）：

❌ 代码跑飞了，按 Ctrl + C → Claude 直接退出
✅ 要按 Escape
❌ 想看 10 分钟前的对话 → 往上翻半天
✅ 双击 Escape，直接跳转
❌ 表单不知道如何按 submit，不小心按了 esc 导致再来一遍 ***
四、实战应用：避免踩坑
技巧 9：Git 工作流 - 让 Claude 管理代码

Claude 可以自动完成整个 Git 流程。

能做什么：

创建 GitHub 仓库（公开/私有），安装好 GitHub CLI
写规范的 commit message
Push 代码
创建 Pull Request 我的工作流：

告诉 Claude：「帮我把这个项目提交到 GitHub，创建私有仓库」

Claude 会：

看 git status 和 git diff
参考项目的 commit 历史
生成规范的 commit message
执行 add、commit、push

真实数据：

我现在有几十个网站项目（都在 ./websites/ 目录下），每个项目的 Git 提交都是 Claude 帮忙做的。

Commit message 写得规范、仔细。而且它能准确总结改动，不像我经常写「fix bug」「update」这种废话 commit。所以能动嘴，就不要自己动手。

最佳实践：

在 CLAUDE.md 里写一句：「Commit message 用中文，参考项目历史 commit 风格」

Claude 就懂了。

技巧 10：代码 Review 救命指南 - 血泪教训

这是我付出最惨代价学到的一课。

labubu 壁纸网站，3 天 8000 UV，一夜之间流量归零。

怎么回事？

我想加多语言，让 Cursor 改代码。改完了，看了眼预览，没问题，直接 accept。

没想到 Cursor 顺手把 <head> 里的 title、description 改成了中文。

这些标签网页上看不见，但搜索引擎看得见。

我的网站从英文网站变成了中文网站。老外用英文搜，当然搜不到。

教训：

Vibe coding 一时爽，没 review 全归零。

如何避免：

1. 关键代码必须 review
SEO 相关（title、description、keywords）
数据库操作
支付流程
权限控制
2. 让 Claude 解释改动

不确定时问：「你刚才改了什么？为什么这样改？」

3. 本地验证

部署前用 pnpm run build 检查报错

4. 定期检查源代码

Chrome 开发者工具 → Elements → <head> 标签

检查 title、description、Open Graph 标签是否正确

现在我的做法：

涉及 SEO、支付、权限的改动：

让 Claude 先解释要改什么
改完后列出所有改动
我过一遍关键部分
本地测试 + build 验证
再上线 ***
五、一点点总结

用 Claude Code 小半年，最大的感受：Claude Code 几乎是万能工具了，不只是写代码。我已经开始用它在写公众号、做 PPT，不断优化改造成一个「AI 系统」。

是的，你没猜错，这篇文章，也主要由 Claude Code 写的，我只是作为「小编」稍微改改稿子，加点配图。

但工具只是工具，把工具的价值最大化的发挥出来，就各显神通了。

一点上手步骤：

还没用 Claude Code 的朋友，先安装上，API 可以先买中转账号，或者用智谱、MiniMax、DeepSeek、Kimi...等等平替
用 Claude Code 做一个简单的网页、游戏
使用 Claude Code 搭建自己的自动化系统

就这些。开搞吧。

相关资源
Agent Skills 精选集：https://agentskills.best
我的开源 Skills：https://github.com/littleben/awesomeAgentskills
WaytoAGI 社区：AI 编程区有更多实战经验 https://waytoagi.feishu.cn/wiki/Pxj8wsMmOii7ZSkN0mYc8xdtnHb

---
*导入时间: 2026-01-17 21:28:17*
