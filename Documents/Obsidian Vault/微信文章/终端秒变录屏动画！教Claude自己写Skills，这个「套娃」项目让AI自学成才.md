---
title: "终端秒变录屏动画！教Claude自己写Skills，这个「套娃」项目让AI自学成才"
source: wechat
url: https://mp.weixin.qq.com/s/08SPdHb6grql_ThbpC7Smw
author: 阿星AI工作室
pub_date: 2025年10月24日 11:58
created: 2026-01-17 22:05
tags: [AI, 编程]
---

# 终端秒变录屏动画！教Claude自己写Skills，这个「套娃」项目让AI自学成才

> 作者: 阿星AI工作室 | 发布日期: 2025年10月24日 11:58
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/08SPdHb6grql_ThbpC7Smw)

---

哈喽，大家好

我是阿星👋🏻

最近我发现了一个十年老开发宋老师有趣的claude code skills 周边小项目——


claude-code-skills  

项目地址：https://github.com/daymade/claude-code-skills


一行代码，就能让枯燥的命令行“活”起来，自动生成酷炫的GIF动画。

但这，只是这个「套娃」神器的开胃菜。

它真正颠覆的地方在于——你能“教”Claude自己给自己写技能 (Skills) 了。没错，就是写skills的元·skills……

再比如文档格式转换技能，也不在话下。

注意事项：

1、这是一个套娃项目，一个项目打包了n个sklls，本文只选了其中4个，你可以选自己感兴趣的部分实操

2、这个项目的文档非常清楚明了、循序渐进，如果你有基础可以直接看md。

3、这个项目全程国产大模型可用，条件只有一个你有claudecode，没安装的同学看我之前更新的👉🏻DeepSeekV3.1+ClaudeCode丨小白5分钟写出高颜值封面生成器

用人话说Claude Skills就是...

先说下claude skills到底啥意思，以免不知道的同学全程脱离语境😵💫


大家可以翻翻刘聪NLP这个账号《浅谈Claude Skills，Github已经5.2k Star了》的讲解，简单说——

Claude Skills里是啥玩意儿，就是这些东西！

• SKILL.md = 工作手册（告诉Claude怎么做）
• scripts/ = 专业工具（Python脚本、自动化程序）
• references/ = 参考资料（API文档、知识库）
• assets/ = 现成素材（模板、图片等）




为什么skills这个思路很聪明？




因为AI的"记忆"有限，一次性塞太多信息会混乱。Skills采用"分层加载"策略：先看技能简介判断用哪个→确定后再读工作手册→需要时才查具体工具和资料。

具体怎么用这些技能工作呢？下面是我选的其中4个作为演示。

项目实操演示

首先快速安装或者gith clone项目到本地：

git clone https://github.com/daymade/claude-code-skills.git




然后回到终端里打开claude，跟着下面的做就可以了。
Cli-demo sklls 动画演示




这个功能是借助 VHS 生成专业的动态 CLI 演示和终端录制。

该技能包含三种录制，按需选择，阿星演示的是第一种：

1. 自动生成：填好要演示的命令，运行脚本就自动录成 GIF，适合简单操作，最快最省事；
2. 批量生成：把多个演示的命令写进配置文件，一次生成好几个，适合做系列演示；
3. 互动录制：启动脚本后自己在终端正常操作，结束后自动转成 GIF，适合复杂、实时的操作

效果还是很适合做demo演示的（忽略这个彩色背景，是生成的这个黑色终端动画）比如生成艺术字命令行录制：

比如终端画心油腻操作也能录下来——

首先我们安装CLI demo generation这个skills

# CLI 演示生成（CLI demo generation）
/plugin marketplace install daymade/claude-code-skills#cli-demo-generator

然后键入自己想要生成的命令行脚本，大家可替换引号里的内容，直接复制下面一整段到终端即可

scripts/auto_generate_demo.py \
  -c "npm install lodash"  # 安装轻量工具库，仅几 KB
  -c "node -e 'const _ = require(\"lodash\"); console.log(_.chunk([1,2,3,4], 2))'"  # 简单使用示例
  -o lodash-demo.gif 
  --title "阿星AI工作室 - lodash安装演示"

一开始可能会提示你VHS is not installed!，直接让你cc给你装好就可以了。这个过程可能要花10分钟。



skill-creator：技能制造机

这是一个套娃skills，是skills他爹。

有点像专门生成提示词的提示词生成器。

这个工具能帮你：

• 快速生成技能模板（就像填空题一样简单）
• 检查你做的技能是否合格
• 把技能打包分享给别人

首先安装 skill-creator ，依次在claude code 终端键入即可。

/plugin marketplace add daymade/claude-code-skills
/plugin marketplace install daymade/claude-code-skills#skill-creator

安装完 skill-creator 后，按照上面三个代码继续验证、打包，先跑完第一次体验。就可以制定自己的skills啦。


# 创建新技能：在 ~/my-skills 目录中创建一个名为 my-awesome-skill 的新技能
"Create a new skill called my-awesome-skill in ~/my-skills"

# 验证技能：验证我在 ~/my-skills/my-awesome-skill 的技能
"Validate my skill at ~/my-skills/my-awesome-skill"

# 打包技能：将我位于 ~/my-skills/my-awesome-skill 的技能打包以供分发
"Package my skill at ~/my-skills/my-awesome-skill for distribution"

比如阿星想让它写的技能是自己很头痛的一个点，

每次做chrome插件都要裁剪3种尺寸，

干脆写一个skills来复用——

Create a new skill called axing-skill in ~/my-skills，这个技能的作用是用户上传图标后即可裁剪为chrome浏览器插件的3种icon尺寸。

直接就是裁剪为符合chrome需求的三种尺寸

过程非常简单，算上写脚本加起来也就5分钟……

一想到下次用skills只要用自然语言要求一下就可以复用

就感觉好省事……

比如你是做财务的，可以用它创建一个"财务报表分析"技能，

以后Claude就能按你的标准来分析报表了。



markdown-tools：文档转格式

这个技能解决了一个很现实的问题：各种文档格式转换。

支持把这些格式转成Markdown：比如Word文档、PDF文件、PPT演示文稿、网页内容

首先你需要先在目录下放你需要转换的文件——

安装好Document conversion skills

# 文档转换（Document conversion）
/plugin marketplace install daymade/claude-code-skills#markdown-tools

然后直接在终端里告诉他要的格式，它直接就转化完了。

再比如doc👉🏻markdown一秒转格式，在文件目录下就能找到。



lm-icon-finder skill：轻松查找大模型图标

llm-icon-finder这个skills可以从 lobe-icons这个库访问 100 多个 AI 模型和 LLM 提供商品牌图标帮助你: 

1、查找并显示AI公司/品牌图标 

2、访问各种LLM提供商的图标资源 

3、获取AI品牌的视觉标识

首先安装对应的skills，直接在终端里键入就好👇🏻

# AI/LLM 图标（AI/LLM icons）
/plugin marketplace install daymade/claude-code-skills#llm-icon-finder

看到✅就是安装成功了

然后用自然语言告诉他你想用这个skills创建查找图标，比如通义icon。

他就会给你找到浅色、深色、png、svg……




点http就可以看到图标啦。


项目中的其他sklls命令总表在这里，直接键入对应的代码就可以安装对应技能：

# GitHub 操作（GitHub operations）
/plugin marketplace install daymade/claude-code-skills#github-ops


# 图表生成（Diagram generation）
/plugin marketplace install daymade/claude-code-skills#mermaid-tools

# 状态栏自定义（Statusline customization）
/plugin marketplace install daymade/claude-code-skills#statusline-generator

# 团队沟通（Teams communication）
/plugin marketplace install daymade/claude-code-skills#teams-channel-post-writer

# Repomix 提取（Repomix extraction）
/plugin marketplace install daymade/claude-code-skills#repomix-unmixer


如果作者后续更新了新的sklls

你可以用下面这个命令行拉取更新后的代码即可

git pull origin main

阿星觉得Claude Code Skills Marketplace是一个很有意思的开源项目。即使不用这个具体的项目，也可以借鉴它的理念，说不定，你也能找到让AI助手变得更好用的方法。

我是阿星，

更多小白AI实战应用

我们下期再见~

---
*导入时间: 2026-01-17 22:05:24*
