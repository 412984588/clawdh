---
title: "告别 Terminal！IDEA 也可以爽用 Claude Code 了？"
source: wechat
url: https://mp.weixin.qq.com/s/q-GTx9Kyj1x_DRFv6fG21A
author: 法欧特的杂谈小铺
pub_date: 2025年12月25日 09:00
created: 2026-01-17 20:22
tags: [AI, 编程]
---

# 告别 Terminal！IDEA 也可以爽用 Claude Code 了？

> 作者: 法欧特的杂谈小铺 | 发布日期: 2025年12月25日 09:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/q-GTx9Kyj1x_DRFv6fG21A)

---

今年最后一个疯狂星期四，首先预祝各位双旦快乐～ 




想必各位 Vide Coding Master 在使用 JetBrains 家 IDE 的时候总有一些苦恼： 如果想要使用 Claude Code、Codex、Gemini CLI 这类终端工具，就要在 IDEA 的命令行中使用它们， 这缺少了一些 UI 交互，也有很大概率会出现终端工具的内容疯狂闪屏的问题（点名批评 Claude Code）。

而现在！AI Assistant 插件更新了对自定义 ACP 的配置支持，现在你可以配置任何支持 ACP 的 Agent 到你的 AI Assistant 中啦！




什么是 ACP？

Agent Client Protocol (ACP)[1], 是一个由 Zed 和 JetBrains 发起的、 用于规范代码编辑器、集成开发环境与编码代理(也就是常说的 AI Agent) 之间的通讯的协议。

简单来说，就是一个专门为了让 AI Agent 与各类 IDE 友好协作的通用协议。

更多有关 ACP 的信息，你可以前往 ACP 的官方网站 https://agentclientprotocol.com[2] 了解更多信息。

配置与使用

如上文所配的图所示，你可以在 AI Assistant 插件右上角的下拉菜单中找到「配置 ACP 智能体」的功能， 点击后会打开一个 acp.json 文件，此时即可配置 ACP 了。

这里我会展示一个已经配置完 Claude Code 和 Codex 之后的 acp.json 文件内容：

{
    "agent_servers": {
        "Claude Code": {
            "command": "claude-code-acp"
        },
        "Codex": {
            "command": "npx",
            "args": [
                "@zed-industries/codex-acp"
            ]
        }
    }
}

之后会继续简单介绍二者具体的配置过程。

Claude Code

Zed 提供了一个针对 Claude Code 的 ACP 适配器：claude-code-acp[3]， 根据文档的描述，我们使用 npm 安装它即可：

npm install -g @zed-industries/claude-code-acp

需要注意的是，这里实际上是需要 -g 来安装到全局的，不知道为什么官方的文档里没有添加它。

安装成功后，上述的配置就可以正常生效啦，现在你可以在 AI Assistant 的选项里看到它了：




而且包括模式选择和模型选择也都有：







我们可以尝试对个话，看看是否可用：






嗯～ 一切正常，而且这里有一个很明显与 AI Assistant 中内置的 Claude Agent 之间的区别： 使用自己配置的 ACP 可以完整识别到你的所有全局配置，包括配置的第三方中转站地址、MCP 之类的工具调用。 而内置的 Claude Agent 模式，最多只能识别到第三方地址，而 MCP 是无法被读取识别使用的。

终于可以不用看CC CLI那闪花眼的超级闪屏BUG了😭

Codex

Zed 也同样实现了一个 Codex 的 ACP 适配器：codex-acp[4]。

不过它不使用 npm i -g 安装，而是使用 npx。 就像上面所展示的 acp.json 里配置的那样，直接配置 npx 命令即可：

{
    "agent_servers": {
        "Codex": {
            "command": "npx",
            "args": [
                "@zed-industries/codex-acp"
            ]
        }
    }
}

同样的，配置完成后就可以选择并使用了：




我本身也没给 Codex 配置太多 MCP，所以看上去不是很多的样子。 它也有部分可选择的选项，例如模式和模型：




按需选择即可。

总结

如果你是 JetBrains 家 IDE 的重度使用者，又苦于 Claude Code 原生 CLI 那闪瞎眼的超级闪屏 BUG， 或者你希望在任何支持 ACP 的 IDE 中得到更好的 AI Agent UX 体验，那么现在就是动手尝试的时候啦～

我也是刚刚才配置的，在元旦假期开始之前，我打算再深度体验几天， 看看通过 ACP 带来的 UX 体验是否能给我带来全面的提升和身心的愉悦～

也感谢你的阅读！如果喜欢，点个赞再走吧！

References

[1] Agent Client Protocol (ACP): https://agentclientprotocol.com/
[2]: https://agentclientprotocol.com
[3] claude-code-acp: https://github.com/zed-industries/claude-code-acp
[4] codex-acp: https://github.com/zed-industries/codex-acp

---
*导入时间: 2026-01-17 20:22:26*
