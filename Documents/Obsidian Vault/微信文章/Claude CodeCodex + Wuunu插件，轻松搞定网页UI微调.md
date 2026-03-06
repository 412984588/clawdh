---
title: "Claude Code/Codex + Wuunu插件，轻松搞定网页UI微调"
source: wechat
url: https://mp.weixin.qq.com/s/HUI5lCKNl-Vf8FYT8it91Q
author: Next蔡蔡
pub_date: 2025年10月6日 05:51
created: 2026-01-17 22:06
tags: [AI, 编程]
---

# Claude Code/Codex + Wuunu插件，轻松搞定网页UI微调

> 作者: Next蔡蔡 | 发布日期: 2025年10月6日 05:51
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/HUI5lCKNl-Vf8FYT8it91Q)

---

哈喽各位精神股东们，我是蔡蔡！
今天给大家分享一款超好用的VS Code插件，能力和实现逻辑上类似之前分享过的 Stagewise 插件，但可以实现在网页上指挥 Claude Code、Codex 以及 Github Copilot 对网页元素“指哪打哪”，不用切换浏览器和 IDE。
视频版看这里：
文字版可以往下看：

在AI编程中，网页UI微调一直是大家比较头疼和抓狂的点，之前也分享过几款实用工具：

Cursor老是“瞎”折腾？用这4款工具给它装上“眼睛”

还在为微调网页UI抓狂？试试Cursor+Stagewise插件

而今天要分享的工具——Wuunu（说实话，这工具我不知道怎么发音），不仅效果立竿见影，使用方法比它的“前辈们”还要更简单。

下面直接上教程：

步骤一：打开并运行网页项目

在 VS Code 中打开并运行你的网页项目：

我这里打开的是一个 Next.js 项目。

之所以先打开网页项目，是方便大家更直观地看到插件使用前后的对比（大家注意：此时的网页上是没有 Wuunu 插件面板的）。




步骤二：安装Wuunu插件

接着打开 VS Code 的插件市场，搜索关键词“Wuunu”，就是这个 Wuunu AI App Builder Extension。

也可以在这里直接下载安装：https://marketplace.visualstudio.com/items?itemName=WuunuAI.wuunu-ai-extension。

安装成功后，一般会自动打开插件的配置窗口，如果没有自动打开，也可以在侧边栏快速找到插件入口。

在配置插件窗口，点击“Insert Wuunu snippet for this app”按钮，它的作用就是将插件的代码片段插入当前应用中。

如果你想知道 Wuunu 的代码片段插入到了哪个项目文件中，可以在搜索框中搜索关键词“Wuunu”，比如在我这个项目中，代码片段是插入在 _app.js 中，代码片段前后都有明显的“WUUNU SINPPET”标识：

    {/* WUUNU SNIPPET - DON'T CHANGE THIS (START) */}
    {process.env.NODE_ENV !== "production" && (
      <>
        <Script id="wuunu-ws" strategy="afterInteractive">
          { `window.__WUUNU_WS__ = "http://127.0.0.1:54585/";` }
        </Script>
        <Script
          id="wuunu-widget"
          src="https://cdn.jsdelivr.net/npm/@wuunu/widget@0.1?cacheParam=455"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </>
    )}
    {/* WUUNU SNIPPET - DON'T CHANGE THIS (END) */}

后续不需要使用这个插件，直接从文件中将这串代码片段删除即可，非常方便。




步骤三：在网页中指挥CC/Codex执行任务

当代码片段插入成功后，重新打开刚才的网页项目，就可以看到 Wuunu 的对话面板，在对话面板中大家可能会看到如下图的告警提示，但不用管它，直接关闭即可。经过实测，不影响后续操作。

在对话窗口，大家一般可以看到三个AI编程工具，包括 Github Copilot ，Claude Code 以及 Codex。

不过每个人打开能看到的工具不尽相同，主要取决于你之前在本地全局安装过哪些工具，比如我之前安装过 Cursor CLI，之前测试的时候也同样会出现，从全局删除后就会消失。

如果你选择的工具是 Claude Code 或 Codex，那么默认调用的模型就是你在相应 CLI 中的配置模型。

接着就可以点击对话窗口的“Select”按钮，在网页上快速选择UI元素。

确定 UI 元素后，就可以输入自己的调整需求。比如我这里输入的是：

将大标题的颜色从 blue-600 改为 gray-800 

Wuunu 就会把所选 UI 元素的信息给到相应的工具如 Claude Code 进行调整。然后你就可以实时看到的，网站的大标题按照调整需求，从蓝色变为灰色。

你也可以使用 Github Copilot，支持的模型包括 GPT-4o，GPT-5-mini，Gemini 2.5 Pro等，虽然暂时不支持其它最顶级的模型，但对调整UI来说绰绰有余了，而且这些模型目前都可以免费使用（还要什么自行车呢）。

在 Wuunu 中使用 Github Copilot 还有一个好处，就是可以支持向前向后查看修改的内容，比如我这里用 Github Coplilot 同时调整了网页上的三个按钮颜色，在完成网页 UI 调整后，还可以点击对话框左上角的向前向后按钮，实时查看前后对比。

对于满意的版本还可以直接点击上方的“Commit Changes”。

如果你觉得 Wuunu 的对话面板太占页面，可以点击右上角的设置icon，将面板的size从Full调整为Medium、Small。

也可以直接点击 Minify 将它缩小为一个 icon。




最后，简单聊聊 Wuunu 和 Stagewise 的异同。

从实现逻辑上看，Wuunu 和 Stagewise 是一样的，两者都是在项目文件中插入相应的配置文件，实现在网页中添加对话窗口。

区别主要在于两者支持的工具，Stagewise 插件目前支持的 AI 编程工具只有 IDE 和 IDE 插件，暂不支持 Claude Code 等 CLI 工具。如果你想要实现 Claude Code 和 Stagewise 的配合，就需要将 Stagewise 升级为 CLI 并且通过 bridge mode 实现，整个实现就比 Wuunu 要更麻烦。

最后的最后，分享我目前在 UI 还原和实现上使用的系列工具：

html to design（Chrome插件+Figma插件）：抓取并还原目标网页（最终得到可编辑的Figma设计稿）


Figma 官方 MCP：将Figma设计稿高度还原（非100%还原）为前端代码页面，之前有专门写过一篇文章>>>Figma官方出手！告别野生Figma MCP和UI幻觉（附案例演示）

Stagewise/Wuunu：解决网页 UI 微调细节

Magic MCP：从 21st.dev 海量组件库中快速查找并创建美观、现代的 UI 组件



以上内容整理自我的知识星球，谢谢你看到了这里。

我是蔡蔡，持续分享 AI 编程、AI Agent，以及我的 AI 学习思考。我们下期见。

---
*导入时间: 2026-01-17 22:06:16*
