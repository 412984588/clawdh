---
title: "【大佬栽树，我乘凉】使用 MCP 的方式调用豆包进行图片处理"
source: wechat
url: https://mp.weixin.qq.com/s/xj8Uw-Nd7hs8YfE9gUzm-Q
author: 天色已晚晴
pub_date: 2025年11月19日 05:59
created: 2026-01-17 20:34
tags: [AI, 编程]
---

# 【大佬栽树，我乘凉】使用 MCP 的方式调用豆包进行图片处理

> 作者: 天色已晚晴 | 发布日期: 2025年11月19日 05:59
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/xj8Uw-Nd7hs8YfE9gUzm-Q)

---

Omni-Adapter 是一个基于 FastMCP 框架的多平台智能图像生成适配器，通过浏览器插件与多个AI平台深度集成，提供统一的 MCP (Model Context Protocol) 服务接口，支持无限次调用不同平台的文生图和图生图功能。



🚀 核心特性
• FastMCP 框架：标准化 MCP 接口，多平台支持（豆包、通义千问）
• 高效调度：智能负载均衡、并发处理、超时管理
• 智能图片处理：自动上传、比例调整、批量下载
• 实时监控：连接状态、任务队列查询
•
📋 系统要求
• Python 3.8+
• Chromium 内核浏览器（Chrome/Edge）
• 豆包客户端或通义千问网页版
• Windows/macOS/Linux
🛠️ 快速安装
1. 安装服务器
git clone https://github.com/HuChundong/Omni-Adapter.git
cd Omni-Adapter/McpServer
pip install -r requirements.txt
2. 安装浏览器插件
1. 打开 chrome://extensions/
2. 开启开发者模式
3. 豆包：加载 DoubaoMcpBrowserProxy/ 目录
4. 通义千问：加载 QwenMcpBrowserProxy/ 目录


3. 配置 AI 平台

豆包客户端（推荐）：

"Doubao.exe" --silent-debugger-extension-api



通义千问：

• 访问 https://chat.qwen.ai
• 登录账号
4. 启动服务
cd McpServer
python server.py

服务地址：

• WebSocket: ws://localhost:8080
• MCP: http://localhost:8081


🎮 MCP 客户端使用
配置服务地址
http://localhost:8081/mcp
演示一下使用cherrystudio的配置










1. 文生图
{
  "tool": "draw_image",
  "parameters": {
    "prompt": "中式园林，古装女孩跳舞",
    "ratio": "2:3",
    "platform": "doubao"
  }
}

支持比例：1:1, 2:3, 3:2, 16:9, 9:16, 4:3, 3:4

2. 图生图
{
  "tool": "edit_image",
  "parameters": {
    "prompt": "添加月光效果",
    "reference_picture": "https://example.com/image.jpg",
    "ratio": "16:9"
  }
}
3. 状态查询
{
  "tool": "get_connection_status"
}
🔧 浏览器插件功能
• ✅ 自动执行文生图/图生图指令
• ✅ 智能图片上传处理
• ✅ 实时图片预览+批量下载
• ✅ 自动刷新、Cookie 管理

插件设置：chrome://extensions/ → 插件选项

⚙️ 高级配置

编辑 McpServer/server.py：

SERVER_HOST = "0.0.0.0"
WS_PORT = 8080
MCP_PORT = 8081
DEFAULT_TIMEOUT = 120.0
MAX_TASKS = 50
🐛 故障排除
问题
	
解决方法


插件无法连接
	
检查 python server.py、端口 8080、防火墙


任务超时
	
确认 AI 平台正常、网络稳定


图片无法下载
	
检查下载权限、清除缓存

查看日志：

• 服务器：python server.py
• 浏览器：F12 → Console（搜索 [Script]）




如果，你想通过python调用，也是可以的

from fastmcp import Client
import asyncio
from loguru import logger
from openai import OpenAI

  

mcp_client = Client("http://192.168.1.148:8081/mcp")

async def list_tools():

    async with mcp_client:

        result = await mcp_client.list_tools()

        tool_list = [{"type": "function","function": tool} for tool in result]

        logger.info(tool_list)

        return tool_list

  
  

async def call_tool(item):

    """
    调用工具进行绘图、图生图处理

    传一个dict参数：{

        "name": 工具名  draw_image  edit_image

        "prompt": 提示词,

        "ratio": 图片比例,

        "reference_picture": 图生图时传入的原图链接,

        "platform": 想要调用哪个平台处理

    }

    """

    async with mcp_client:

        tool_name = item.get("name", "")

        if tool_name == "":

            logger.error(f"请传入需要使用的工具 name")

            return None

        prompt = item.get("prompt", "")

  

        if tool_name == "draw_image" and prompt == "":

            logger.error(f"使用画图工具请输入提示词 prompt")

            return None

        if tool_name == "edit_image" and prompt == "":

            prompt = "优化一下图片"

        ratio = item.get("ratio", "")

        platform = item.get("platform", "")

  

        if tool_name == "draw_image":

            result = await mcp_client.call_tool(tool_name, {"prompt": prompt, "ratio": ratio, "platform": platform})

  

        if tool_name == "edit_image":

            reference_picture = item.get("reference_picture", "")

            if reference_picture == "":

                logger.error(f"使用图生图工具请输入原始图片链接 reference_picture")

                return None

            result = await mcp_client.call_tool(tool_name, {"prompt": prompt, "reference_picture": reference_picture, "ratio": ratio, "platform": platform})

  

        print(result)

        logger.info(result.content[0].text)

---
*导入时间: 2026-01-17 20:34:09*
