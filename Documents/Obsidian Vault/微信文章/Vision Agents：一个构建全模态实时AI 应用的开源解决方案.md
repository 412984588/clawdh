---
title: "Vision Agents：一个构建全模态实时AI 应用的开源解决方案"
source: wechat
url: https://mp.weixin.qq.com/s/iRqYdsrWc74O70zgBAQJiw
author: 机器之魂
pub_date: 2025年12月24日 17:03
created: 2026-01-17 20:22
tags: [AI, 编程]
---

# Vision Agents：一个构建全模态实时AI 应用的开源解决方案

> 作者: 机器之魂 | 发布日期: 2025年12月24日 17:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/iRqYdsrWc74O70zgBAQJiw)

---

当你尝试构建一个能够“看见”、“听见”并即时“响应”的实时 AI 系统，你就会发现要实现整套技术栈会变得有多么复杂。

One SDK for video.
Another for speech.
Another for object detection.
Another for LLMs.

然后，你还需要将所有部分整合起来，处理延迟问题，并设法让整个系统实时运行。

现在，Vision Agents 改变了这一切。

它是一个开源框架，旨在帮助开发者构建能够观看、聆听、理解并采取行动的多模态 AI 智能体——且具有极低延迟。

在本文中，我将解释 Vision Agents 做了什么、为何重要，并通过简明的 Python 示例带你构建第一个实时视频 AI 智能体。

Stream 推出的 Vision Agents，这样一款开源框架，是用于构建能够看见、听见并理解视频内容的实时多模态 AI Agent。这个全面的工具包赋能开发者创建具有超低延迟的智能视频体验，将尖端 AI 模型与强大的基础设施相结合。

Vision Agents 的独特之处

Vision Agents 弥合了 AI 能力与实际视频应用之间的差距，为构建复杂的视觉驱动对话 Agent 提供了完整的生态系统。与传统仅专注于文本或单模态处理的 AI 框架不同，Vision Agents 实现了真正的多模态交互，使 Agent 能够同时实时处理视频、音频和对话上下文。

核心架构

该框架采用模块化、基于插件的架构，在分离关注点的同时保持组件间的紧密集成：

主要功能和能力
实时视频智能

Vision Agents 通过 Stream 的边缘网络，以低于 30ms 的延迟处理视频内容，支持需要瞬时视觉理解和响应的应用程序。

功能
	
描述
	
用例

WebRTC 流媒体	
延迟低于 30ms 的直接视频传输
	
实时指导、游戏、AR/VR

多模型处理	
结合目标检测与 LLM 推理
	
体育分析、安全监控

逐帧分析	
使用自定义模型处理单帧图像
	
质量控制、医学影像

实时姿态追踪	
人体姿态检测与分析
	
健身指导、物理治疗
对话式 AI 集成

该框架与领先的 AI 提供商无缝集成，同时保持对最新功能的原生 API 访问：

支持的 LLM 提供商：

OpenAI：支持原生视频的 Realtime API
Google Gemini：实时多模态对话
Anthropic Claude：高级推理能力
xAI Grok：替代语言模型选项
插件生态系统

Vision Agents 包含20 多个预构建插件，在多个领域扩展功能：

插件类别
	
示例
	
主要能力

语音处理	
Deepgram、ElevenLabs、Fish Audio
	
带说话人分离的 STT/TTS

计算机视觉	
Ultralytics YOLO、Roboflow、Moondream
	
目标检测、姿态追踪

语音合成	
Cartesia、Kokoro、HeyGen
	
逼真的 TTS 和虚拟形象

话轮检测	
Smart Turn、Vogent
	
自然对话流程

云服务	
AWS Bedrock、OpenRouter
	
企业级集成
实际应用
体育指导

结合姿态检测与 AI 指导，提供实时反馈：

agent = Agent(
    edge=getstream.Edge(),
    agent_user=User(name="AI Golf Coach"),
    instructions="Read @golf_coach.md",
    llm=gemini.Realtime(fps=3),
    processors=[ultralytics.YOLOPoseProcessor(model_path="yolo11n-pose.pt")]
)
语音助手

构建具有低延迟语音交互的对话式 AI：

agent = Agent(
    edge=getstream.Edge(),
    agent_user=User(name="Voice Assistant"),
    instructions="Be friendly and helpful. Keep responses short.",
    llm=gemini.LLM("gemini-2.5-flash-lite"),
    tts=elevenlabs.TTS(),
    stt=deepgram.STT(eager_turn_detection=True)
)
开发工作流

Vision Agents 采用基于工作区的架构，在核心功能和插件之间保持清晰分离：

agents-core/          ├── agents/           # Agent 生命周期和会话管理
├── llm/              # LLM 集成和函数调用
├── processors/       # 媒体处理管道
├── events/           # 实时事件系统
└── utils/            # 音频/视频工具
plugins/              # 可扩展插件生态系统
├── openai/           # OpenAI 集成
├── gemini/           # Google Gemini 插件
├── elevenlabs/       # 语音合成
└── [20 多个其他提供商]
快速开始

Vision Agents 旨在为初学者提供友好的入门体验，同时为复杂应用提供高级功能。该框架包含全面的示例、文档和插件开发工具包。

前置条件
Python 3.12+
Stream API 密钥（每月 333,000 免费参与分钟数）
对 async/await 模式的基本了解

Vision Agents 使你能够创建结合以下功能的智能视频体验：

实时视频处理与计算机视觉模型
对话式 AI与语音交互
使用 WebRTC 实现低于 30ms 的低延迟流传输
对视觉和音频内容的多模态理解
架构概述
安装
步骤 1：安装核心包
uv add vision-agents
步骤 2：添加插件集成

完整设置与流行服务集成：

uv add "vision-agents[getstream, openai, elevenlabs, deepgram]"

核心包包含基础功能，但大多数应用需要额外的插件来支持 LLM 提供商、TTS/STT 服务和视频处理器。

步骤 3：获取 Stream API 凭据

注册免费的 Stream 账户，每月可领取 333,000 参与者分钟数，并通过 Maker Program 获得额外积分。

你的第一个语音 Agent

创建一个简单的对话式 Agent，能够实时监听和响应：

import logging
from vision_agents.core import User, Agent, cli, AgentLauncher
from vision_agents.plugins import getstream, deepgram, elevenlabs, gemini
async def create_agent(**kwargs) -> Agent:
    agent = Agent(
        edge=getstream.Edge(),          agent_user=User(name="AI Assistant", id="agent"),
        instructions="你是一个友好的语音助手。保持回答简洁且具有对话性。",
        llm=gemini.LLM("gemini-2.5-flash-lite"),  # 快速响应模型
        tts=elevenlabs.TTS(),  # 自然语音合成
        stt=deepgram.STT(eager_turn_detection=True),  # 快速转录
    )
    return agent
async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)
    with await agent.join(call):
        await agent.simple_response("你好！今天我能为你做些什么？")
        await agent.finish()
if __name__ == "__main__":
    cli(AgentLauncher(create_agent=create_agent, join_call=join_call))
你的第一个视频 AI Agent

添加带有计算机视觉的实时视频处理：

from vision_agents.plugins import getstream, ultralytics, gemini
async def create_agent(**kwargs) -> Agent:
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(name="AI Golf Coach"),
        instructions="你是一名高尔夫教练。观察用户的挥杆动作并提供反馈。",
        llm=gemini.Realtime(fps=3),  # 与 Gemini 共享视频帧
        processors=[
            ultralytics.YOLOPoseProcessor(model_path="yolo11n-pose.pt")  # 姿态检测
        ],
    )
    return agent
配置选项
组件	选项	使用场景
LLM	gemini.LLM()
, openai.LLM(), gemini.Realtime(), openai.Realtime()
	
文本处理 vs 实时多模态

TTS	elevenlabs.TTS()
, kokoro.TTS(), aws.Polly()
	
云端 vs 本地语音合成

STT	deepgram.STT()
, wizper.STT(), fast_whisper.STT()
	
实时 vs 批量转录

处理器	ultralytics.YOLOProcessor()
, roboflow.Detection()
	
计算机视觉和视频分析

轮次检测	smart_turn.TurnDetection()
, vogent.TurnDetection()
	
对话流程管理

使用实时 LLM（gemini.Realtime(), openai.Realtime()）获得最低延迟 - 它们内部处理 STT/TTS 并通过 WebRTC 直接处理视频。

运行你的 Agent

1. 在 .env 文件中设置环境变量：

STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
GEMINI_API_KEY=your_gemini_key  # 或 OPENAI_API_KEY
ELEVENLABS_API_KEY=your_11labs_key
DEEPGRAM_API_KEY=your_deepgram_key

2. 运行 Agent：

uv run your_agent.py

3.访问在浏览器中自动打开的演示 UI




参考：

Vision Agents Repository: https://github.com/GetStream/Vision-Agents.git

https://medium.com/coding-nexus/vision-agents-the-open-source-framework-for-building-real-time-video-ai-6c97d959033f

---
*导入时间: 2026-01-17 20:22:47*
