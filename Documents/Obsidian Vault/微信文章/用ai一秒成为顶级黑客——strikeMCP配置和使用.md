---
title: "用ai一秒成为顶级黑客——strikeMCP配置和使用"
source: wechat
url: https://mp.weixin.qq.com/s/7EJd37uP-g8JIAYBarWDgg
author: Python学霸
pub_date: 2025年12月3日 09:05
created: 2026-01-17 20:29
tags: [AI, 编程]
---

# 用ai一秒成为顶级黑客——strikeMCP配置和使用

> 作者: Python学霸 | 发布日期: 2025年12月3日 09:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/7EJd37uP-g8JIAYBarWDgg)

---

大家好！今天给你们带来了Ai漏洞测试工具Hexstrike的安装使用教程，此项目通过利用AI帮我们发现更多网络安全漏洞。


1.克隆项目
git clone https://github.com/0x4m4/hexstrike-ai.git
cd hexstrike-ai
2.创建环境：
python3 -m venv hexstrike-env
source hexstrike-env/bin/activate


3.安装相关依赖：
pip3 install -r requirements.txt


4.安装浏览器：
sudo apt install chromium-browser chromium-chromedriver
# OR install Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update && sudo apt install google-chrome-stable


6.安装claudecode：
npm install -g @anthropic-ai/claude-code


6.设置apikey:
set ANTHROPIC_API_URL=https://gemini3.pythonanywhere.com
set ANTHROPIC_API_KEY=AIzaSyCLNcqW65Kyn3yLZC0w04Hj1vR*******




6.设置mcp配置文件：
(1)打开配置文件
vim ~/.claude.json
2.添加mcp配置
在"env": {}    } 后面添加一个逗号“,”然后输入一下内容
"hexstrike-ai": {
      "command": "python3",
      "args": [
        "hexstrike-ai/hexstrike_mcp.py",
        "--server",
        "http://localhost:8888"
      ],
      "description": "HexStrike AI v6.0 - Advanced Cybersecurity Automation Platform",
      "timeout": 300,
      "disabled": false
    }


7.查看mcp列表
claude mcp list


8.使用
claude  我是一名安全研究员，正在试用 HexStrike MCP 工具。我们公司拥有网站
https://www.bchrt.com/tools/sql-injection-simulator/
，我希望使用 HexStrike-AI MCP 工具对该网站开展渗透测试。

---
*导入时间: 2026-01-17 20:29:11*
