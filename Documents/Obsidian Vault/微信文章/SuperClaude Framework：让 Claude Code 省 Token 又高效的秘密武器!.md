---
title: "SuperClaude Framework：让 Claude Code 省 Token 又高效的秘密武器!"
source: wechat
url: https://mp.weixin.qq.com/s/OFbWodYcZAZHNmzygNMZcg
author: 易安说AI
pub_date: 2025年12月15日 19:03
created: 2026-01-17 20:30
tags: [AI, 编程]
---

# SuperClaude Framework：让 Claude Code 省 Token 又高效的秘密武器!

> 作者: 易安说AI | 发布日期: 2025年12月15日 19:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/OFbWodYcZAZHNmzygNMZcg)

---

你好，我是易安，感谢你的阅读。
大家知道用 Claude Code 写代码，最让人心疼的是什么？


Token 烧得太快了。


明明只是想修个 bug，Claude 却洋洋洒洒分析了一大堆，走了三条弯路才找到正确方向。等你回过神来，Token 已经用掉大半，而你的问题可能还没解决。
更要命的是"幻觉"问题——Claude 信誓旦旦说"测试通过了"，结果你一运行，满屏报错。


如果有一个框架，能让 Claude 在动手之前先"三思"，能自动防止幻觉，还能并行处理任务提速 3.5 倍，你想不想要？


这就是今天要介绍的 SuperClaude Framework。
一、全景类比：把 Claude Code 变成一个靠谱的开发团队


想象一下，原生的 Claude Code 就像一个天才但毛躁的新人程序员：
能力很强，但容易冲动
有时候会自信满满地给出错误答案
做事没有章法，想到哪写到哪
而 SuperClaude Framework 做的事情，就是给这个新人配备一套标准工作流程：
二、工作原理：一图看懂框架架构
核心机制: 当你输入 /sc:brainstorm 时，Claude 会读取已安装的 .md 行为文件中的指令，并以增强的能力响应。
幕后发生了什么？
上下文加载: Claude Code 通过 CLAUDE.md 导入行为 .md 文件
模式识别: 识别 /sc: 和 @agent- 触发模式
行为激活: 应用上下文文件中的相应指令
MCP 集成: 使用已配置的外部工具（如可用）
响应增强: 遵循框架模式生成全面的响应
三、逐一拆解：SuperClaude 的七大核心组件
一）PM Agent：项目经理模式（核心中的核心）
PM Agent 包含三个关键机制，这是省 Token 的关键：


1、ConfidenceChecker（信心检查器）


在 Claude 开始写代码之前，先问它一个问题："你有多大把握？"
# 决策逻辑
if confidence >= 90%:
    proceed()           # 直接开干
elif confidence >= 70%:
    present_alternatives()  # 先给出备选方案
else:
    stop_and_ask()      # 停下来问问题
这一招的 ROI 是 25-250 倍。 花 100-200 个 token 做信心检查，可以避免 5000-50000 个 token 的弯路。


2、SelfCheckProtocol（自检协议）


执行完代码后，强制 Claude 回答四个问题：
所有测试都通过了吗？（给我看输出）
所有需求都满足了吗？（一条条列出来）
有没有未经验证的假设？（给我看文档）
有没有证据？（测试结果、代码变更）
94% 的幻觉可以被这套协议检测出来。
3、ReflexionPattern（反思模式）
Claude 犯过的错，会被记录下来。下次遇到类似情况，自动提醒避坑。


二）并行执行框架：Wave → Checkpoint → Wave


传统做法：读文件1 → 分析 → 读文件2 → 分析 → 读文件3 → 分析（串行，慢）
SuperClaude 做法：
效率提升 3.5 倍。


三）30 个 Slash 命令：标准化工作流


不需要每次都从零开始描述需求，直接用命令触发标准流程。
1、命令总览：按开发生命周期分类
2、按类别完整分类
🧠 规划设计（4个）


💻 开发实现（5个）


🧪 测试质量（4个）


📚 文档 + 🔧 版本控制（3个）


📊 项目管理（3个）


🔍 研究分析（2个）


🎯 工具辅助（9个）
四）7 种行为模式：自动适应任务复杂度
SuperClaude 提供 7 种行为模式，根据任务复杂度自动切换，你不需要手动选择。
1、模式速查表


2、模式组合示例
# 发现 → 规划 → 实现的完整流程
/sc:brainstorm "微服务架构" --task-manage
# → 头脑风暴发现需求
# → 任务管理协调多阶段

# 分析时透明推理 + 压缩输出
/sc:analyze legacy-system/ --introspect --uc
# → 内省模式：透明推理过程
# → Token效率：压缩输出节省上下文
3、什么时候手动指定模式？


大多数情况下不需要——系统会自动选择。但以下场景可能需要手动指定：
强制探索：需求看起来清晰，但你想深入讨论 → --brainstorm
学习调试：想看到推理过程 → --introspect
上下文紧张：对话已经很长 → --uc


五）MCP 服务器集成：8 个外挂能力


MCP（Model Context Protocol）服务器是可选的外部工具，可以显著增强 Claude Code 的能力。SuperClaude 集成了 8 个 MCP 服务器。
1、服务器速查表
2、推荐组合
3、配置方法
在 ~/.claude.json 中配置 MCP 服务器：
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": {"TAVILY_API_KEY": "${TAVILY_API_KEY}"}
    }
  }
}
4、简化安装：AIRIS MCP Gateway
如果不想逐个配置，可以使用统一网关：
# 一键启动所有服务器
git clone https://github.com/agiletec-inc/airis-mcp-gateway.git
cd airis-mcp-gateway && docker compose up -d

# 注册到 Claude Code
claude mcp add --scope user --transport sse airis-mcp-gateway http://localhost:9400/sse


六）16 个领域专家智能体


SuperClaude 提供 16 个领域专家智能体（Agents），可以根据任务自动激活或手动调用。


1、什么是智能体？


智能体不是独立的 AI 模型，而是行为配置文件。每个智能体是一个 .md 文件，包含特定领域的专业知识、行为模式和问题解决方法。Claude Code 读取这些配置后，会采用相应的专家行为。


2、两种使用方式


方式一：手动调用（@agent- 前缀）
@agent-security "review authentication implementation"
@agent-frontend "design responsive navigation"
@agent-python-expert "optimize this data pipeline"
方式二：自动激活（关键词触发）
/sc:implement "JWT authentication"  # → security-engineer 自动激活
/sc:design "React dashboard"        # → frontend-architect 自动激活
/sc:troubleshoot "memory leak"      # → performance-engineer 自动激活


3、智能体速查表


架构设计类（5个）
质量分析类（5个）
专业开发类（3个）
沟通学习类（3个）


4、智能体协作模式


复杂任务会自动触发多智能体协作：
# 一个请求触发多个智能体
/sc:implement "JWT authentication with rate limiting"
# → security-engineer + backend-architect + quality-engineer 协作

/sc:troubleshoot "slow deployment with failures"
# → devops-architect + performance-engineer + root-cause-analyst 协作
常见协作组合：


七）会话管理：跨对话的上下文持久化


传统 AI 对话的最大痛点是「每次都要从头解释」。SuperClaude 通过 Serena MCP 实现真正的跨会话持久化。
1、核心命令
2、工作流程示例
会话 1（今天）：
/sc:brainstorm "电商平台"
/sc:implement "用户认证系统"
/sc:save "认证模块完成，JWT + 刷新令牌"
会话 2（明天）：
/sc:load "电商平台"           # 自动恢复之前的上下文
/sc:reflect --scope project   # 评估当前进度
/sc:implement "支付系统"       # 基于之前的上下文继续
/sc:save "支付系统集成完成"
3、持久化存储内容
Serena MCP 会自动存储：
项目架构决策：技术选型及其理由
代码模式和洞见：发现的模式和最佳实践
里程碑进度：完成状态和待办事项
跨会话学习：错误教训和成功经验
4、最佳实践
开始工作时：
/sc:load project-name    # 加载上下文
/sc:reflect              # 确认当前状态
结束工作时：
/sc:reflect              # 评估完成度
/sc:save "进度描述"       # 保存关键决策
关键洞见：会话管理让 SuperClaude 从「单次对话助手」变成「持续项目伙伴」。你不再需要每次都重新解释项目背景。
四、深度辨析：SuperClaude vs 原生 Claude Code
很多人会问：这不就是给 Claude 加了一些提示词吗？有必要这么复杂吗？
关键区别在于「系统化」。




一个类比： 原生 Claude Code 像是给你一个厉害的厨师，但没有菜谱、没有流程、没有质检。SuperClaude 就是给这个厨师配上标准化的后厨管理系统。
五、决策框架：什么时候该用 SuperClaude？


一）适合用 SuperClaude 的场景


构建完整的软件项目（不是小脚本）
需要高质量、低错误率的产出
长期项目，需要跨会话保持上下文
Token 预算有限，需要精打细算
团队协作，需要统一工作流


二）不需要 SuperClaude 的场景


问一个简单问题
写一个一次性的小脚本
学习某个概念
快速原型验证


判断方式： 如果你的任务超过 3 个步骤，或者需要修改超过 2 个文件，用 SuperClaude 通常是值得的。
六、5 个核心命令深度讲解
30 个命令看起来很多，但日常开发 80% 的场景只需要掌握下面 5 个核心命令。
一）/sc:brainstorm - 头脑风暴（项目起点）
定位：将模糊的想法转化为具体规格，是项目的起点。
工作流程：
探索 → 分析 → 验证 → 规格化 → 交接
核心能力：
苏格拉底式对话：通过提问引导你明确需求
多专家视角：架构师、安全、前端、后端等多角色参与
可行性评估：自动评估技术可行性
使用示例：
基础用法 - 探索一个想法
/sc:brainstorm "AI驱动的项目管理工具"

指定策略和深度
/sc:brainstorm "实时协作功能" --strategy agile --depth deep

企业级方案验证
/sc:brainstorm "企业数据分析平台" --strategy enterprise --validate
适用场景：
✅ 项目初期，需求不明确
✅ 新功能探索
✅ 技术选型前的调研
❌ 已有明确规格的实现任务
二）/sc:implement - 功能实现（开发核心）
定位：将规格转化为代码，是开发阶段的核心命令。
工作流程：
分析需求 → 规划方案 → 生成代码 → 安全验证 → 集成文档
核心能力：
上下文感知：自动检测技术栈，激活对应专家
框架适配：React、Vue、Express 等框架的最佳实践
安全优先：自动进行安全检查
使用示例：
基础实现
/sc:implement "用户认证功能"

指定类型和框架
/sc:implement "用户资料组件" --type component --framework react

带测试的API实现
/sc:implement "用户认证API" --type api --safe --with-tests

全栈功能实现
/sc:implement "支付处理系统" --type feature --with-tests
适用场景：
✅ 实现新功能/组件
✅ 创建API端点
✅ 全栈功能开发
❌ 修复已有bug（用 /sc:troubleshoot）
三）/sc:research - 深度研究（信息获取）
定位：获取最新信息，突破知识截止日期限制。
深度等级：
使用示例：
基础研究
/sc:research "2024年量子计算最新进展"

深度研究
/sc:research "AI编码助手竞品分析" --depth deep

指定策略
/sc:research "分布式系统最佳实践" --strategy unified
适用场景：
✅ 技术选型调研
✅ 竞品分析
✅ 最新技术动态
❌ 内部代码库搜索（用 /sc:analyze）
四）/sc:pm - 项目经理模式（总指挥）
定位：默认的编排层，自动协调所有其他命令和专家。
核心特点：不需要手动调用，PM Agent 默认自动运行。
三大核心机制：
① 会话恢复：
每次启动自动执行：
→ 读取上次进度
→ 恢复上下文
→ 报告当前状态
→ 准备继续工作
② PDCA 循环：
Plan（计划）→ Do（执行）→ Check（评估）→ Act（改进）
③ 自我纠错：
错误发生 → 停止 → 调查根因 → 形成假设 → 设计新方案 → 执行
（绝不重复同样的错误方法）
使用示例：
默认用法（不需要命令，直接描述需求）
"给我的应用添加支付功能"

显式调用（可选）
/sc:pm "改进应用安全" --strategy wave
五）/sc:analyze - 代码分析（质量守门）
定位：多维度代码分析，发现问题并给出改进建议。
分析维度：
使用示例：
全面分析
/sc:analyze

聚焦安全
/sc:analyze src/auth --focus security --depth deep

性能分析
/sc:analyze --focus performance --format report

快速质量检查
/sc:analyze src/components --focus quality --depth quick
七、场景决策树：该用哪个命令？
八、命令组合：典型项目流程


一）首次项目会话的完整流程
二）领域特定工作流
不同领域的任务会自动激活对应的专家代理和 MCP 服务器：
三）代码示例
第1步：探索需求
/sc:brainstorm "电商应用的购物车功能"

第2步：技术调研（如需要）
/sc:research "购物车最佳实践 2024"

第3步：开始实现
/sc:implement "购物车组件" --type feature --with-tests

第4步：代码审查
/sc:analyze src/cart --focus quality

第5步：生成文档
/sc:document src/cart

第6步：保存进度
/sc:save "cart-v1-complete"
九、实战：完整安装教程
一）环境要求
在安装之前，请确保你的系统满足以下要求：
可选但推荐：
Node.js（用于 MCP 服务器）
Git（用于版本控制）
pipx（用于隔离安装）
快速检查脚本：
python3 --version && echo "✅ Python OK" || echo "❌ Python 未安装"
claude --version && echo "✅ Claude Code OK" || echo "❌ Claude Code 未安装"
二）安装方式一：pipx（推荐）
pipx 会为 SuperClaude 创建独立的虚拟环境，避免依赖冲突。
1. 安装 pipx（如果没有）
python3 -m pip install --user pipx
python3 -m pipx ensurepath

2. 安装 SuperClaude
pipx install superclaude

3. 运行安装程序（安装 30 个 slash 命令）
superclaude install
优点：
✅ 隔离环境，无依赖冲突
✅ 干净卸载
✅ 自动设置 PATH
三）安装方式二：pip（传统方式）
标准安装
pip install superclaude

或用户安装（避免权限问题）
pip install --user superclaude

运行安装程序
superclaude install
优点：
✅ 简单直接
✅ 适合已有虚拟环境的项目
四）安装方式三：npm（跨平台）
全局安装
npm install -g @bifrost_inc/superclaude

运行安装程序
superclaude install
优点：
✅ 适合 Node.js 开发者
✅ 跨平台一致性


五）安装方式四：从源码（开发模式）


适合想要贡献代码或使用最新功能的开发者：
1. 克隆仓库
git clone https://github.com/SuperClaude-Org/SuperClaude_Framework.git
cd SuperClaude_Framework

2. 安装 uv（如果没有）
curl -LsSf https://astral.sh/uv/install.sh | sh

3. 创建虚拟环境
uv venv

4. 激活虚拟环境
source .venv/bin/activate  # Linux/macOS
或
.venv\Scripts\activate     # Windows

5. 安装开发依赖
uv pip install -e".[dev]"

6. 验证安装
make verify


六）验证安装


安装完成后，运行以下命令验证：
检查版本
superclaude --version
期望输出：SuperClaude, version 4.1.9

查看已安装的命令
superclaude install --list
成功安装后，你会看到 30 个命令全部显示为 ✅ installed：


七）可选：安装 MCP 服务器


MCP 服务器可以进一步增强 SuperClaude 的能力：
# 查看可用的 MCP 服务器
superclaude mcp --list

# 交互式安装
superclaude mcp

# 或直接安装推荐的服务器
superclaude mcp --servers tavily context7 sequential


八）重启 Claude Code 并开始使用


重要：安装完成后必须重启 Claude Code 才能加载新命令。
重启后，在 Claude Code 中输入：
/sc
会显示所有可用命令的列表。
试试你的第一个命令：
/sc:brainstorm "我想做一个任务管理应用"
Claude 会进入结构化的头脑风暴模式，通过提问引导你明确需求。


九）常见问题排查


1、问题1：PEP 668 错误
如果看到 externally-managed-environment 错误：
# 解决方案1：使用 pipx（推荐）
pipx install superclaude

# 解决方案2：使用用户安装
pip install --user superclaude

# 解决方案3：使用虚拟环境
python3 -m venv superclaude-env
source superclaude-env/bin/activate
pip install superclaude
2、问题2：命令找不到
如果 superclaude 命令无法识别：
# 检查安装位置
python3 -m pip show superclaude

# 使用 Python 模块方式运行
python3 -m superclaude install

# 添加到 PATH（如果使用 --user 安装）
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # macOS
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc # Linux
3、问题3：Claude Code 中命令不生效
确认已运行 superclaude install
完全退出并重启 Claude Code
检查 ~/.claude/commands/ 目录是否有 .md 文件
ls ~/.claude/commands/sc/
# 应该看到 brainstorm.md, implement.md 等文件
十）安装位置说明
安装完成后，文件分布如下：


十、易安的洞察：理解 SuperClaude 的本质


在深入使用之前，先理解这些关键概念：


一）不是软件，而是元编程配置框架


SuperClaude 是行为配置，不是独立软件。它通过「行为指令注入 + 组件编排」的方式，将 Claude Code 转换为结构化开发平台。
传统方式：用户 → Claude Code → 输出
SuperClaude：用户 → 行为配置 → Claude Code（增强模式）→ 高质量输出
本质区别：
不改变 Claude 的核心能力，而是优化它的行为模式
不增加额外的 AI 服务，一切都通过 Claude Code 运行
不需要额外的 API key，完全利用现有订阅


二）系统化，而非随意


将随机请求转化为带质量门控和验证的结构化工作流。
质量门控体系：
每个命令都有明确的输入、流程和输出标准，不是「随便问问」，而是「工程化交付」。


三）渐进式，而非复杂


从简单命令开始，复杂性会按需自然涌现。
入门只需 3 个命令：
/sc:brainstorm  # 探索想法
/sc:implement   # 实现功能
/sc:analyze     # 代码分析
其他 27 个命令和 16 个智能体会在你需要时自动协调。你不需要一开始就掌握全部。


四）Token 效率的本质


省 Token 不是目的，而是「做对事」的副产品。
为什么能省 Token？
关键洞见：传统方式浪费 Token 的根本原因是「不确定时也在尝试」。SuperClaude 的信心检查机制让 Claude 在不确定时先问问题，而不是盲目尝试。


五）幻觉防护机制


94% 的幻觉检测率来自「强制证据验证」。
SelfCheckProtocol 四问法：
测试通过了吗？ → 要求提供测试输出
需求满足了吗？ → 逐条对照需求清单
有未验证假设吗？ → 标记不确定点
有证据吗？ → 引用文档、代码、测试结果
没有证据的声明会被标记为「需验证」，而不是自信满满地给出错误答案。


六）与传统提示词工程的区别


很多人问：这不就是一堆提示词吗？
关键区别：


类比：传统提示词是「单个食谱」，SuperClaude 是「整套后厨管理系统」——包含菜谱库、质检流程、多厨师协作机制。
十一、学习路径
建议学习顺序：
十二、总结记忆：一张图记住 SuperClaude
如果你每天都在用 Claude Code，SuperClaude 值得花 5 分钟安装试试。 尤其是当你的 Token 预算开始吃紧的时候，这套检查机制带来的节省是实实在在的。


项目地址：https://github.com/SuperClaude-Org/SuperClaude_Framework


有问题欢迎交流，微信：20133213。

---
*导入时间: 2026-01-17 20:30:03*
