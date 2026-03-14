---
title: "用Claude Skills解决自己开发Chrome插件的小痛点"
source: wechat
url: https://mp.weixin.qq.com/s/7VUIzD0tnkImN8atADEGRg
author: Next蔡蔡
pub_date: 2025年11月27日 23:31
created: 2026-01-17 20:30
tags: [AI, 编程]
---

# 用Claude Skills解决自己开发Chrome插件的小痛点

> 作者: Next蔡蔡 | 发布日期: 2025年11月27日 23:31
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/7VUIzD0tnkImN8atADEGRg)

---

哈喽各位精神股东，我是蔡蔡！

今天分享我用 Claude Skills 解决的一个小痛点，让 AI 自动搜索并获取我开发 Chrome 浏览器插件所需的全套图标（包括SVG和四种标准尺寸的PNG）。

以下是完整实践和思考过程。

视频版：

文字版：




大家可以先看效果。

当我在提示词中给出了图标关键词，比如“beer图标”，就会触发这个叫做“iconify-chrome-icons”的 Skills，然后它就会运行脚本在主流的 icon 图标库搜索符合要求的 SVG 图标文件，并转为 Chrome 浏览器插件所需的四种标准尺寸的 PNG。

整个实现过程拆解出来大概有三步：




步骤一：梳理标准化流程并验证

Skills 的本质是标准操作手册（即SOP），所以创建 Skills 之前，我会先思考自己的任务流程能否标准化，以及怎么标准化。

比如这次的任务流程可以分为三步：

图标搜索：根据输入的关键词（如 "beer"），在iconfont、font awesom等主流图标库查找图标；

图标下载：自动下载第一个匹配结果的 SVG 文件；

图标格式处理：将 SVG 转换为 Chrome 插件要求的 4 种 PNG 尺寸。




虽然这三步都可以用一个脚本来实现，但对于已经有 SVG 图标只想转格式的场景，我就没法用这个脚本来实现 SVG 图标转 PNG 了。  

所以这时候更好的选择，是搜索和下载图标用一个脚本实现，SVG格式转化用另一个脚本实现。这也是 Skills 创建中比较推荐的“原子组合”方法。

接着就是按照这个思路让 AI 给你生成脚本，然后去验证这一版的脚本是否符合需求。

如果符合需求，就可以进入下一步。




步骤二：用官方 skill-creator 将步骤一脚本打包为新 Skill

有了现成的脚本后，就可以将它打包为一个全新的 Skill，方便后续调用。

打包的方法也很简单：

1）安装 anthropic-agent-skills 这个官方 Marketplace

在 Claude Code 中输入 /plugin，在弹出的选项中选择「Add marketplace」

接着在打开的窗口输入 anthropics/skills（就是官方 Skills 的 Marketplace 仓库地址）；

这样就成功添加官方 Skills 的 Plugin Marketplace 了。




2）安装 anthropic-agent-skills Marketplace 中的 example-skills

回到 Plugins 管理面板，选择 Browser & install plugins；

在打开的 marketplace 管理界面，选择你刚才安装的 anthropic-agent-skills；

接着你就会看到 plugins 列表，选择其中的 example-skills 进行安装即可，因为我们这次要使用的 skill-creator skill 就是其中的一个。

安装成功后重启 Claude Code 就可以看到  skill-creator skill。




3）调用 skill-creator skill 将步骤一的脚本打包为新 Skill

有了 skill-creator skill 后，我们就可以让 Claude Code 将步骤一的脚本打包为符合规范的 Skills

我们可以在提示词中直接指明调用 skill-creator 将哪几个脚本打包为全新的 Skills，同时再次阐述这个 Skills 的核心能力

调用 skill-creator 将'tool-icon-gen.js'打包为一个全新的skill，实现根据用户提示词中的关键词,去搜索/下载相应的SVG图标,并转化为符合Chrome浏览器插件所需的四种标准尺寸的PNG

最后我们就能得到一个可用的新 Skills。

当然，从打包创建 Skills 到 Skills 完全可用的过程不一定很顺。

比如AI没有把 Skills 创建在 .claude/skills 目录；又比如之前在终端可用的脚本，在 CLI 中跑全流程时却和预期有点距离……

不过这些都是小问题，反馈给 AI 调整即可。这个过程记得随时提交 Git 进行版本管理。

看到这里，大家可能会有疑问：为什么不将步骤一和步骤二合并为一步，让 AI 理解需求后直接调用 skill-creator skill 来实现？

一步到位的方法其实之前尝试过，但效果不太理想，往往会存在过度设计 Skills 的情况，而过度设计 Skills 会带来流程冗余和 token 爆炸，而后者与 Skills 的设计初衷背道而驰（这种情况也可能是我实现方式不佳导致的，欢迎大家讨论和指正）。




步骤三：创建 Plugin 并上传新 Skill（非必需）

如果你想要将自定义的 Skill 分享出去，除了直接分享本地文件，还可以通过创建 Marketplace 和 Plugin 的方式实现。

对于非开发者，如果看官方文档（https://code.claude.com/docs/en/plugins）去创建，可能会觉得很头大。

没关系，可以直接把文档发给 AI ，让AI帮我们创建。

https://code.claude.com/docs/en/plugins,请根据官方文档创建marketplace和plugin并将extension-icon skill打包进去

后面我会把这段时间创建的有用的 Skills，都通过 Marketplace 的方式分享出来。




为什么要开发 iconify-chrome-icons Skill？

之所以开发这么个 Skills，是因为之前用 AI 开发 Chrome 浏览器插件，我经常苦恼图标配置的问题。

之前一般会遇到这么两种情况：

第一种是 AI 默认在 manifest.json 不添加 icons 字段，这时候你加载到 Chrome 浏览器的插件图标会显示为一个灰色的拼图块（Chrome 的默认图标），或者是插件名称的首字母。

这种虽然能加载成功，但很丑（好吧，我有点强迫症），我也很难在浏览器右上角的一堆图标中快速找到它。

另一种是 AI 在 manifest.json 添加了 icons 字段，但它在项目中没给出这个字段所需的 PNG 图标文件。

当它加载到 Chrome 浏览器时就会出现这种失败提示：

这时候就只能自己找 SVG 图标然后再转 PNG 格式。后来嫌这个方法太笨，我就弄了个工具站专门做 SVG 转 Chrome 所需的图标尺寸，但考虑到使用频次和成本就没有部署到线上，导致每次都得单独运行。

而现在，我可以把这个从图标搜索、下载到转格式的流程，都固定为一个 Skills。它只在我需要的时候触发。

我不需要自己找图标，也不需要把之前的工具站找出来再转格式，直接一步到位，真的解决了我之前的一个小痛点。

以上就是今天的全部内容，谢谢你看到了这里。
我是蔡蔡，持续分享 AI 编程、AI Agent，以及我的 AI 学习思考。我们下期见。

---
*导入时间: 2026-01-17 20:30:58*
