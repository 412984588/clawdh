---
title: "claude code快速在各种大模型服务之间切换"
source: wechat
url: https://mp.weixin.qq.com/s/bPH2BcjvBrayONTn2dYb5w
author: 疯狂的石头
pub_date: 2025年10月9日 00:48
created: 2026-01-17 22:49
tags: [AI, 编程]
---

# claude code快速在各种大模型服务之间切换

> 作者: 疯狂的石头 | 发布日期: 2025年10月9日 00:48
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/bPH2BcjvBrayONTn2dYb5w)

---

现在每一家国产大模型新发布个版本都宣布自己远超包括 claude 在内的所有竞品，并且都提供 anthropic 兼容接口邀请大家上 claude code 来挑战一把。但是每次在他们之间切换配置都有点麻烦，有的用ANTHROPIC_API_KEY 有的用 ANTHROPIC_AUTH_TOKEN，有的还要指定最新的模型，干脆在 ~/.zshrc 里面写了几个简单的小函数来解决这摊子麻烦事：


useDS() {
  unset ANTHROPIC_API_KEY
  export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
  export ANTHROPIC_AUTH_TOKEN=......
  export ANTHROPIC_MODEL=DeepSeek-V3.2-Exp
}


useZP() {
  unset ANTHROPIC_API_KEY
  export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
  export ANTHROPIC_AUTH_TOKEN=......
  export ANTHROPIC_MODEL=GLM-4.6
}


useKimi() {
  unset ANTHROPIC_AUTH_TOKEN
  export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
  export ANTHROPIC_API_KEY=......
  export ANTHROPIC_MODEL=kimi-k2-turbo-preview 
}


zsh控制台上执行 source ~/.zshrc 以后输入use按tab就都出来了。
当然也可以把 claude 或者 claude -c 命令放到每个函数最后一行。如果是个人项目，甚至可以更野一点吧 claude --dangerously-skip-permissions 或者 claude --dangerously-skip-permissions -c 放到最后一行。

---
*导入时间: 2026-01-17 22:49:28*
