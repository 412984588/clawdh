---
title: "Claude Code最强外挂辅助神器！！！"
source: wechat
url: https://mp.weixin.qq.com/s/g6sLcqkXH2aeWlxn-tbdDA
author: 做个幸运儿
pub_date: 2025年10月13日 11:54
created: 2026-01-17 22:27
tags: [AI, 编程]
---

# Claude Code最强外挂辅助神器！！！

> 作者: 做个幸运儿 | 发布日期: 2025年10月13日 11:54
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/g6sLcqkXH2aeWlxn-tbdDA)

---

话不多说，直接上干货！你是不是也遇到过这种场景： 刚想愉快写点 Claude Code，结果被各种配置支配的恐惧。 直到我遇见了这个
claude-code-templates
能做什么：
agent：161个agent开箱即用
command：支持210个快捷命令
settings：60个自定义配置
Hooks：39个hook功能
mcp：55个mcp直接安装即用
plugins：最厉害的，直接将上述所有功能集成到plugins中


Demo
1、🚀 Claude 项目一键成型

新建项目仅需要敲一条命令👇

npx claude-code-templates@latest --agent backend-engineer --mcp github-integration --command generate-tests


几秒钟之后，.claude/、命令、hooks、MCP 全部自动生成， 干净、优雅、完美运行。 

2、🔍 可视化监控，第一次看到 Claude 在“干啥”

用 Claude Code 最大的问题是：黑盒。 到底谁在跑命令、哪个 Agent 吃最多 token？ 现在这个工具直接内置了本地 dashboard， 能显示对话量、token 花费、命令统计图—— 就像在 Claude 背后装了个“监控摄像头”。







3、🧠 健康检查 + 项目引导

Health Check，能扫描项目配置、提示缺项、修复建议全自动。 并且还有有 Project Setup 向导，像带你一步步走完注册流程。

一句话形容它： 👉 “不懂配置，也能用 Claude Code。”



安装教程

第一步：安装，并手动选择模板

npx claude-code-templates@latest


或者直接选定 Agent、MCP、命令：

npx claude-code-templates@latest --agent frontend-dev --mcp github --commandtest

第二步：启动监控与健康检查

npx claude-code-templates@latest --analytics
npx claude-code-templates@latest --health-check


生成后的 .mcp.json 大概长这样：

{
  "mcpServers": {
    "github": {
      "type": "github",
      "token": "<你的 token>",
      "apiBase": "https://api.github.com"
    }
  }
}



相关地址：
开源地址：https://github.com/davila7/claude-code-templates
模板下载地址：https://aitmpl.com
claudecode：https://www.myclaudecode.com?inviteCode=MYCLAJQS




附录：


plugins：


（1）ai-ml-toolkit：AI 与机器学习开发套件，包括：


5个agent：人工智能工程师、机器学习工程师、nlp工程师、计算机视觉工程师、Mlops工程师。


安装：/plugin install ai-ml-toolkit@claude-code-templates


（2）devops-automation：DevOps自动化，包括：


5个命令：设置Cicd管道、dockercompose设置、kubernetes部署、监控设置、备份策略
4个agent：DevOps工程师、云架构师、Kubernetes专家、基础设施工程师
2个Mcp服务器：Github集成、Docker Mcp


安装：/plugin install devops-automation@claude-code-templates
（3）documentation-generator：文档生成器，包括：


5个命令：生成api文档、更新文档、创建用户指南、设置Docusaurus、生成变更日志
3个agent：技术作家、api文档专家、Docusaurus专家
1个mcp服务器：文件系统


安装：/plugin install documentation-generator@claude-code-templates


（4）supabase-tool：supabase工具包，包括：
5个命令：Supabase 备份管理器、Supabase 数据浏览器、Supabase 迁移助手、Supabase 性能优化器、Supabase 模式同步
2个agent：数据工程师、数据科学家
3个mcp服务：Postgresql 集成、Mysql集成、Supabase


安装：/plugin install supabase-toolkit@claude-code-templates


(5) project-management-suite：项目管理，包括：

6个命令：Sprint 计划、创建路线图、任务分解、项目估算、站会生成器、项目回顾会
3个agent：产品策略师、业务分析师、技术主管
2个mcp：notion集成、linear平台集成


安装：/plugin install project-management-suite@claude-code-templates


往期推荐：


Claude Code 教程：从入门到精通的 CLI 智能编程助手指南

---
*导入时间: 2026-01-17 22:27:32*
