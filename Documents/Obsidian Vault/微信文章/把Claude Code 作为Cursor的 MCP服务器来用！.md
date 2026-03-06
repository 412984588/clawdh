---
title: "把Claude Code 作为Cursor的 MCP服务器来用！"
source: wechat
url: https://mp.weixin.qq.com/s/AmiK6FuCEjJ-i5e2b5QKOw
author: 字节笔记本
pub_date: 2025年11月7日 21:36
created: 2026-01-17 20:46
tags: [AI, 编程]
---

# 把Claude Code 作为Cursor的 MCP服务器来用！

> 作者: 字节笔记本 | 发布日期: 2025年11月7日 21:36
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/AmiK6FuCEjJ-i5e2b5QKOw)

---

Claude Code CLI真是天才一般的设计。

下可以嵌入所有系统，运行在任何的场景当中，上可以吞没n8n编排工作流，作为bolt的基座。

别学n8n了！用Claude Code Skills 复刻n8n工作流


Claude Code甚至还可作为 MCP 服务器，让其他 AI 工具能够调用它。

真的是可攻可受！

作为 MCP 服务器的Claude Code可以作为其它AI工具的增加模式。除了暴露一系列强大的工具，各个作业连接之间还能互相隔离。

比如当使用 Cursor进行大型代码重构时，遇到性能瓶颈或功能限制就完全可以明确指示工具将任务委托给 Claude Code 处理，之后Claude Code 处理完，将结果返回给主工具进行审查和整合。

再就是新手友好，不用脱离熟悉的图形界面客户端了，也就不需要了解终端操作或命令行语法。

下面就具体的操作过程。

打开终端，执行以下命令安装和配置 Node.js：

# 安装 Node.js 最新版本
nvm install node
nvm use node


安装 Node.js 后，全局安装 Claude Code。通过 npm 的全局安装命令：

npm install -g @anthropic-ai/claude-code


首次运行需要执行带有特殊标志的命令来跳过权限提示。

MCP 服务器模式是无界面运行的，无法交互式地提示用户授权：

claude --dangerously-skip-permissions


将 Claude Code 配置为 Cursor 编辑器的 MCP 服务器，Cursor 的配置文件位于：

~/.cursor/mcp.json


打开这个文，添加以下配置：

{
  "mcpServers": {
    "claude-code": {
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}


导航到"工具与集成"部分，点击"新建 MCP 服务器"。

添加上述 JSON 配置。

配置成功如图：

之后在 Cursor 中，你需要明确告诉它使用 Claude Code，例如：

使用 claude code 将此组件重构为使用 React hooks


Cursor 会使用它自己的原生能力来处理请求。

Windsurf 的配置过程与 Cursor 差不多。配置文件位于：

~/.codeium/windsurf/mcp_config.json


使用相同的 JSON 结构：

{
  "mcpServers": {
    "claude-code": {
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}


保存配置文件后，重启 Windsurf 即可使配置生效。

也可以同时处理多个项目。

配置多个实例的方式是在配置文件中添加多个服务器定义：

{
  "mcpServers": {
    "claude-code-frontend": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {
        "PWD": "/projects/frontend"
      }
    },
    "claude-code-backend": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {
        "PWD": "/projects/backend"
      }
    }
  }
}


定义了两个独立的 Claude Code 服务器。

一个用于前端项目，工作目录设置为 /projects/frontend；另一个用于后端项目，工作目录设置为 /projects/backend。

这里通过 PWD 环境变量，每个实例都会在其指定的目录中运行，保持各自的上下文和状态。

另外如果需要启用调试模式获得更详细的信息，可以在配置文件中添加调试环境变量：

{
  "mcpServers": {
    "claude-code": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {
        "MCP_CLAUDE_DEBUG": "true"
      }
    }
  }
}


不过，但是，也是有部分的代价的。

Claude Code 通常占用 200 到 500 MB 的内存。当作为 MCP 服务器运行时，会额外增加 50 到 100 MB 的开销，而且每个客户端连接都会启动一个独立的 Claude Code 进程。但是依然会比Cursor等图形界面的占用少。

Claude Code 也不仅仅只是作为 MCP 服务器，而且也不只是作为编程来使用，更多高级使用可以关注字节笔记微信公众号。

---
*导入时间: 2026-01-17 20:46:08*
