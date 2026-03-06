---
title: "偶然刷到的一个逆天项目：AI黑客..."
source: wechat
url: https://mp.weixin.qq.com/s/7BRF-3zBR1ZQ5rTBvMPekA
author: JackCui
pub_date: 2025年11月12日 03:36
created: 2026-01-17 21:11
tags: [AI, 编程]
---

# 偶然刷到的一个逆天项目：AI黑客...

> 作者: JackCui | 发布日期: 2025年11月12日 03:36
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/7BRF-3zBR1ZQ5rTBvMPekA)

---

做过独立开发的朋友都清楚，虽然现在 AI 已经能写出相当不错的前端，后端也有成熟的 BaaS 服务，但应用开发并不仅仅只是写份代码。

在整个开发流程中，还有一个经常被忽视但至关重要的环节：安全测试。

然而在安全测试中，传统的静态分析工具误报率高，人工渗透测试又耗时耗力。

好消息是：这部分工作，AI 现在也能帮你完成了。

我每天都会刷 GitHub ，这两天我发现有个项目天天新增 2k+ 星标，在 GitHub trending 上的势头可谓是独一份。

没几天过去，星标数已经快涨到 1w 了，并且还在飞速上涨中。

这是一个由 AI 驱动安全测试的开源 Agent 工具：Strix ，可替代人工进行自主渗透测试。

Strix 是一个能自主运行的智能体，它的行为模式就像真正的黑客一样。它不仅能够动态运行代码、发现安全漏洞，还能通过实际的攻击进行验证，大大减少了误报问题。

以往需要人工数周完成的渗透测试，它可以在数小时内完成，提速 30× ，效率拉满。

Strix 专门为了需要快速、准确安全测试的开发人员和安全测试团队打造。

目标很简单：在无需人工渗透测试的情况下实现快速精准的安全检测，避免传统手动测试的麻烦，并杜绝静态分析工具频发误报。

指路链接：

https://github.com/usestrix/strix

一、Strix 详细介绍
核心亮点

Strix 开箱即用，提供完整的黑客工具包，包含 HTTP 代理、浏览器自动化等工具。

它运行真实的攻击、查找漏洞，编写详细报告，甚至能自动编写修复代码，7×24 小时监控保护用户的应用程序。

视频1.mp4

它还对每一个 finding 都要求包含 PoC （概念验证）和漏洞处理证据，从根本上避免误报的情况。

此外，它采用分布式代理协作，使用多个专业代理并行工作来提高测试效率。

同时容器化隔离环境也确保测试过程的安全性和可控性。

使用场景

Strix 可以应用在多种场景中：

检测和验证应用程序中的关键漏洞。
在数小时内快速完成渗透测试并生成合规性报告。
自动执行漏洞赏金任务并生成 PoC 为报告生成提速。
集成进 CI/CD 流程，在上线前就发现并阻止漏洞。
覆盖的漏洞检测

Strix 能够检测到的漏洞种类非常全面，包括：

访问控制：IDOR 、权限提升、身份验证绕过
注入攻击：SQL 、NoSQL 、命令注入
服务器端：SSRF 、XXE 、反序列化缺陷
客户端：XSS 、原型污染、DOM 漏洞
业务逻辑：竞争条件、工作流作
身份验证：JWT 漏洞、会话管理
基础架构：配置错误、服务暴露
二、快速上手
本地使用

一些准备：

Docker
Python 版本需要在 3.12+
有 API 可以调用 LLM ，或者本地有 LLM

克隆存储库。

git clone https://github.com/usestrix/strix.git
cd strix


安装开发依赖项。

make setup-dev

# or manually:
poetry install --with=dev
poetry run pre-commit install


配置 LLM 提供程序。

export STRIX_LLM="openai/gpt-5"
export LLM_API_KEY="your-api-key"


在开发模式下运行 Strix 。

poetry run strix --target https://example.com


第一次运行拉取沙盒 Docker image ，结果保存在 agent_runs/<run-name> 下。

云托管版本

如果想要更省事的方式，可以先试用一下 Strix 官方的云托管版本。

它还支持预订 demo 展示，更多信息请移步：

https://usestrix.com/

使用示例
默认用法
# Local codebase analysis
strix --target ./app-directory

# Repository security review
strix --target https://github.com/org/repo

# Black-Box Web application assessment
strix --target https://your-app.com

# Grey-Box Security Assesment
strix --target https://your-app.com --instructions "Perform authenticated testing using the following credentials user:pass"

# Multi-target white-box testing (source code + deployed app)
strix -t https://github.com/org/app -t https://your-app.com

# Focused testing with instructions
strix --target api.your-app.com --instruction "Focus on business logic flaws and IDOR vulnerabilities"

Headless Mode

使用 -n/--non-interactive 标志通过编程方式运行 Strix ，无需交互式 UI ，非常适合服务器和自动化作业。CLI 在退出之前会打印出实时的漏洞发现和最终报告。发现漏洞时会以非零代码退出。

strix -n --target https://your-app.com

CI/CD

可以将 Strix 添加到管道中，然后使用轻量级 GitHub Actions 工作流程对拉取请求运行安全测试：

name: strix-penetration-test

on:
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Strix
        run: pipx install strix-agent

      - name: Run Strix
        env:
          STRIX_LLM: ${{ secrets.STRIX_LLM }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}

        run: strix -n -t ./

三、最后

从安装到运行，整个过程非常轻量化，通过 pipx 安装并配置 LLM 密钥即可使用。

有需要的开发者和做安全测试相关的小伙伴可以体验看看，对自己 vibe 的项目，上线前也都可以接入这个项目做一个快速的渗透测试。

>/ 本期作者：Tashi  & JackCui

>/ JackCui：AI领域从业者，毕业于东北大学，大厂算法工程师，热爱技术分享。

---
*导入时间: 2026-01-17 21:11:51*
