---
title: "AI 辅助软件开发通用方法论"
source: wechat
url: https://mp.weixin.qq.com/s/wgDQeVjek6cYzxCg460a2g
author: 易安说AI
pub_date: 2025年11月5日 10:42
created: 2026-01-17 21:20
tags: [AI, 编程, 产品]
---

# AI 辅助软件开发通用方法论

> 作者: 易安说AI | 发布日期: 2025年11月5日 10:42
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/wgDQeVjek6cYzxCg460a2g)

---

你好，我是易安，击下方👇关注我,一起AI破局!


有一段时间没有写长文了。
今天看到reddit上的一位程序员分享了自己六个月时间,用claudecode重写了30万行代码的一些经验。 
不知不觉我也使用ClaudeCode进行辅助开发过去6个月了，最多的一个月我就写了20万行代码，你要知道spring源码才10万行，现在通过CC可以写超出自己能力外的功能和产品，不限任何语言，这简直太可怕了(如果需要低成本高效实用ClaudeCode可以联系我的微信：20133213)。 
今天我也总结一些这六个月的经验，以下内容部分也参考了JokeGold的经验，尤其是自动触发skills，质量审查体系搭建等等，这些都非常实用，我一直以来也是这么用的，现在也推荐给你。
本文值得收藏+转发，已经剔除大量的口水文，包含可直接复用的提示工程框架，上下文管理框架，软件开流程。
一、核心理念
1. 规划优先原则（Planning-First Principle）

核心思想：永远不要让 AI 在没有明确计划的情况下开始工作。

通用应用：

需求分析：让 AI 先研究现有系统，理解上下文，再制定方案
架构设计：要求 AI 提供多个方案选项，而不是直接实施第一个想法
实施工作：将大任务分解为 3-5 个阶段，每个阶段都有明确的成功标准

具体实践：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
错误做法：
用户："给我添加用户认证功能"
AI：立即开始编码


正确做法：
用户："我需要添加用户认证功能，请先：
1. 研究现有的认证模式
2. 提供 2-3 个技术方案（OAuth/JWT/Session）
3. 说明每个方案的优缺点
4. 等我选择后再制定详细计划"

关键收益：

减少返工和错误
确保方案符合现有架构
提前识别潜在问题
2. 渐进式上下文管理（Progressive Context Management）

核心思想：AI 的上下文窗口是有限资源，需要智能管理。

通用策略：

2.1 分层文档系统

轻量级指引文档（< 500 行）：

快速参考指南
项目特定的配置
常用命令和脚本

详细专题文档（按需加载）：

深入的技术指南
具体领域的最佳实践
详细的 API 参考

实施示例：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
项目根目录/
├── QUICK_START.md          # 200 行，快速入门
├── ARCHITECTURE.md         # 300 行，架构概览
└── docs/
    ├── authentication/      # 详细认证文档
    ├── database/           # 详细数据库文档
    ├── frontend/           # 详细前端文档
    └── deployment/         # 详细部署文档
2.2 任务上下文持久化

三文件结构（适用于任何大型任务）：

ounter(lineounter(lineounter(lineounter(line
task-tracker/
├── [任务名]-plan.md        # 战略计划和阶段划分
├── [任务名]-context.md     # 关键决策和文件路径
└── [任务名]-tasks.md       # 检查清单（可随时更新）

每个文件的作用：

plan.md 模板：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# [任务名] 实施计划


## 执行摘要
[一段话描述目标]


## 阶段划分
### 阶段 1: [名称]
- **目标**: [具体可交付成果]
- **成功标准**: [可测试的结果]
- **风险**: [潜在问题]
- **工时**: [估算]


### 阶段 2-5: [类似结构]


## 技术决策
- 决策 1: [选择 X 而不是 Y，原因是...]
- 决策 2: [...]


## 依赖关系
- 外部依赖: [...]
- 内部依赖: [...]

context.md 模板：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# [任务名] 上下文


## 最后更新
[时间戳]


## 关键文件
- `/path/to/file1.ts` - [作用说明]
- `/path/to/file2.ts` - [作用说明]


## 关键决策记录
### [日期] - 决策：使用 X 技术
**原因**: [...]
**影响**: [...]
**替代方案**: [...]


## 下一步行动
1. [具体任务]
2. [具体任务]


## 待解决问题
- [ ] [问题描述]

tasks.md 模板：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# [任务名] 任务清单


## 阶段 1: [名称]
- [x] 完成的任务 1
- [x] 完成的任务 2
- [ ] 待完成的任务 3
- [ ] 待完成的任务 4


## 阶段 2: [名称]
- [ ] 待开始的任务
3. AI 质量自检机制（AI Self-Review Mechanism）

核心思想：不要盲目信任 AI 的第一次输出，建立自动化的质量检查。

通用模式：

3.1 自动触发审查

触发时机：

AI 完成一个完整功能后
AI 修改了关键代码路径
AI 添加了高风险代码（数据库操作、认证逻辑等）

审查维度：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
安全性审查：
- [ ] 是否有 SQL 注入风险？
- [ ] 是否有 XSS 风险？
- [ ] 敏感数据是否加密？
- [ ] 认证授权是否正确？


性能审查：
- [ ] 是否有 N+1 查询问题？
- [ ] 是否有内存泄漏风险？
- [ ] 是否有不必要的重复计算？


可维护性审查：
- [ ] 代码是否符合项目规范？
- [ ] 是否有足够的注释？
- [ ] 是否遵循了既定的架构模式？
- [ ] 错误处理是否完整？
3.2 温和的提醒

设计原则：非阻塞式提醒，让 AI 自我意识到需要检查的点。

示例提醒模板：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
📋 代码质量自检提醒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━


⚠️  检测到数据库操作
   修改了 3 个文件


自检问题：
   ❓ 是否添加了事务处理？
   ❓ 是否有适当的错误处理？
   ❓ 是否添加了数据验证？


💡 最佳实践提醒：
   - 所有数据库操作应包裹在事务中
   - 使用参数化查询防止 SQL 注入
   - 添加适当的索引优化性能


━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. 知识模块化与复用（Knowledge Modularization）

核心思想：将领域知识、最佳实践、代码模式封装成可复用的模块。

通用实施：

4.1 技能/规则库结构

框架无关的技能示例：

架构设计原则 skills：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 架构设计原则


## 分层架构模式
### 展示层 (Presentation Layer)
- 职责：处理用户交互，展示数据
- 不应包含：业务逻辑、数据访问逻辑


### 业务逻辑层 (Business Logic Layer)
- 职责：实现核心业务规则
- 不应包含：UI 代码、直接数据库访问


### 数据访问层 (Data Access Layer)
- 职责：与数据存储交互
- 不应包含：业务逻辑


## 依赖注入原则
优先使用依赖注入而非单例模式...


## 关注点分离
每个模块应该只有一个改变的理由...

错误处理模式 skills：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 错误处理最佳实践


## 通用原则
1. **快速失败**：尽早检测错误
2. **明确错误信息**：包含足够的上下文
3. **适当的错误级别**：区分可恢复和不可恢复错误


## 错误处理层级


### 应用层错误处理
- 用户友好的错误消息
- 错误日志记录
- 错误追踪（如 Sentry）


### 服务层错误处理
- 业务异常转换
- 重试逻辑
- 回退机制


### 数据层错误处理
- 连接错误处理
- 事务回滚
- 死锁重试
4.2 skills激活机制

自动激活触发器：

关键词触发：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
{
  "authentication": {
    "keywords": ["auth", "login", "token", "session", "jwt"],
    "skill": "认证安全最佳实践"
  },
  "database": {
    "keywords": ["query", "database", "sql", "migration"],
    "skill": "数据库设计与优化"
  }
}

文件路径触发：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
{
  "pathPatterns": [
    {
      "pattern": "**/api/**/*.{js,ts}",
      "skill": "API 设计最佳实践"
    },
    {
      "pattern": "**/components/**/*.{jsx,tsx}",
      "skill": "UI 组件开发规范"
    }
  ]
}

内容模式触发：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
{
  "contentPatterns": [
    {
      "pattern": "SELECT.*FROM",
      "skill": "SQL 安全与优化"
    },
    {
      "pattern": "async.*await",
      "skill": "异步编程最佳实践"
    }
  ]
}
5. 人机协作边界（Human-AI Collaboration Boundaries）

核心思想：明确什么时候应该让 AI 工作，什么时候开发者应该介入。

AI 擅长的场景：

✅ 模式识别和代码生成
✅ 重复性任务自动化
✅ 代码重构和优化
✅ 测试用例生成
✅ 文档生成和更新
✅ 代码审查和静态分析

开发者应该主导的场景：

🧑‍💻 架构重大决策
🧑‍💻 业务逻辑验证
🧑‍💻 安全关键代码审查
🧑‍💻 性能瓶颈诊断
🧑‍💻 用户体验设计
🧑‍💻 复杂 bug 的根因分析

介入规则：

"三次尝试规则"：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
如果 AI 在同一个问题上失败 3 次：
1. STOP - 停止让 AI 继续尝试
2. ANALYZE - 分析为什么会失败
   - 是提示词不够清晰？
   - 是问题超出了 AI 的能力范围？
   - 是需要更多的上下文？
3. DECIDE - 决定下一步
   - 调整提示词策略
   - 分解成更小的问题
   - 你亲自解决

开发者介入的信号：

AI 开始"胡言乱语"或产生不相关的代码
AI 多次产生相同的错误
任务需要深层次的领域知识
涉及商业决策或用户隐私
二、通用架构模式
1. 自动化质量门控（Automated Quality Gates）

核心组件：

1.1 编辑追踪器
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
目的：记录所有代码变更
触发时机：每次文件编辑后
记录内容：
- 修改的文件路径
- 修改时间戳
- 所属模块/服务
- 变更类型（新增/修改/删除）
1.2 构建验证器
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
目的：确保代码变更不破坏构建
触发时机：AI 完成一轮响应后
验证内容：
- 编译错误检查
- 类型检查（TypeScript/其他强类型语言）
- Lint 检查
- 依赖完整性检查


错误处理策略：
- 错误 < 5 个：立即展示给 AI 修复
- 错误 ≥ 5 个：建议启动专门的错误修复流程
1.3 测试运行器
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
目的：确保代码变更不破坏现有功能
触发时机：关键代码路径修改后
测试范围：
- 单元测试
- 集成测试（如果受影响）
- 回归测试（关键路径）


测试策略：
- 快速测试：每次修改后运行
- 完整测试：重要里程碑后运行
1.4 格式化器
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
目的：保持代码风格一致
触发时机：文件保存/提交前
工具示例：
- Prettier（JavaScript/TypeScript）
- Black（Python）
- gofmt（Go）
- rustfmt（Rust）


注意：考虑 token 消耗，可以选择手动触发
2. 模块化知识系统（Modular Knowledge System）

设计原则：

2.1 主指引文件（< 500 行）
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 项目快速参考


## 项目概述
[3-5 句话描述项目]


## 快速命令
[常用命令列表]


## 架构概览
[指向详细架构文档]


## 重要规则
[5-10 条核心规则]


## 详细文档索引
[指向各个专题文档]
2.2 专题深入文档（每个 < 500 行）
ounter(lineounter(lineounter(lineounter(lineounter(line
认证专题/
├── overview.md          # 认证系统概览
├── jwt-implementation.md    # JWT 实现细节
├── oauth-flow.md        # OAuth 流程
└── security-checklist.md    # 安全检查清单
2.3 自动激活配置
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
{
  "skills": {
    "authentication": {
      "mainFile": "authentication/overview.md",
      "resources": [
        "jwt-implementation.md",
        "oauth-flow.md",
        "security-checklist.md"
      ],
      "triggers": {
        "keywords": ["auth", "login", "token"],
        "files": ["**/auth/**", "**/middleware/auth*"],
        "content": ["passport", "jwt.sign", "authenticate"]
      }
    }
  }
}
3. 专业化代理系统（Specialized Agent System）

设计原则：一个代理只做一件事，并把它做好。

通用代理模板：

代码审查代理
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 代码审查代理


## 角色定义
你是一个专业的代码审查员，专注于识别代码质量问题。


## 审查维度
1. **架构一致性**：代码是否符合项目架构模式
2. **最佳实践**：是否遵循了编程语言和框架的最佳实践
3. **安全性**：是否存在安全漏洞
4. **性能**：是否存在明显的性能问题
5. **可维护性**：代码是否易于理解和维护


## 输出格式
### 严重问题（必须修复）
- [问题描述]
  - 位置：[文件:行号]
  - 原因：[为什么这是问题]
  - 建议：[如何修复]


### 改进建议（可选优化）
- [建议描述]


### 优点（值得保持）
- [好的做法]


## 审查流程
1. 阅读变更的代码
2. 对照最佳实践检查
3. 识别问题和改进点
4. 生成结构化报告
测试生成代理
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 测试生成代理


## 角色定义
你是一个测试工程师，为给定的代码生成全面的测试用例。


## 测试策略
1. **正常路径测试**：验证核心功能
2. **边界条件测试**：测试极端情况
3. **异常路径测试**：验证错误处理
4. **集成测试**：验证与其他组件的交互


## 测试覆盖目标
- 语句覆盖率：> 80%
- 分支覆盖率：> 70%
- 关键路径覆盖率：100%


## 输出要求
- 每个测试有清晰的描述
- 使用项目的测试框架
- 遵循项目的测试组织结构
- 包含必要的 mock 和 stub
性能优化代理
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 性能优化代理


## 角色定义
你是一个性能工程师，识别并优化性能瓶颈。


## 分析维度
1. **算法复杂度**：识别 O(n²) 或更差的算法
2. **数据库查询**：识别 N+1 问题和缺失的索引
3. **内存使用**：识别内存泄漏和不必要的内存分配
4. **网络请求**：识别可以批处理或缓存的请求


## 优化策略
- 使用缓存减少重复计算
- 批处理减少网络往返
- 异步处理提高响应速度
- 懒加载减少初始加载时间


## 输出格式
### 发现的瓶颈
- [瓶颈描述]
  - 当前性能：[指标]
  - 优化建议：[具体方案]
  - 预期提升：[估算]
三、工作流程最佳实践
1. 提示词工程（Prompt Engineering）

通用提示词模板：

功能开发提示词
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 背景
我正在开发 [项目名称]，这是一个 [项目类型] 项目。
现有架构：[简要描述]


# 目标
我需要实现 [具体功能]


# 要求
1. 功能需求：
   - [需求 1]
   - [需求 2]


2. 技术约束：
   - 必须使用 [技术栈]
   - 必须兼容 [现有系统]


3. 性能要求：
   - 响应时间 < [X]ms
   - 并发支持 [X] 用户


4. 安全要求：
   - [安全要求列表]


# 请先
1. 研究现有相关代码
2. 提供 2-3 个实现方案
3. 分析每个方案的优缺点
4. 等待我选择后再实施
Bug 修复提示词
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# Bug 描述
[清晰描述 bug 现象]


# 复现步骤
1. [步骤 1]
2. [步骤 2]
3. [观察到的错误]


# 预期行为
[应该发生什么]


# 相关上下文
- 文件：[相关文件路径]
- 错误日志：[错误信息]
- 环境：[开发/测试/生产]


# 请
1. 分析可能的根本原因
2. 提供诊断步骤
3. 等待我确认后再修复
代码审查提示词
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 审查范围
请审查以下变更：
[文件列表或 git diff]


# 审查重点
1. 安全性
2. 性能
3. 可维护性
4. 是否遵循项目规范


# 输出要求
- 明确标识严重问题 vs 改进建议
- 提供具体的修改建议
- 指出好的做法
2. 增量式开发（Incremental Development）

阶段划分原则：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
大任务：实现用户认证系统


阶段 1：基础设施（1-2 天）
├── 设置数据库表
├── 创建用户模型
└── 基本 CRUD 操作
✅ 成功标准：可以创建和查询用户


阶段 2：认证逻辑（2-3 天）
├── 密码哈希
├── JWT 生成和验证
└── 登录/登出端点
✅ 成功标准：用户可以登录并获得 token


阶段 3：授权中间件（1 天）
├── Token 验证中间件
├── 权限检查
└── 保护路由
✅ 成功标准：受保护的路由只有认证用户能访问


阶段 4：高级功能（2-3 天）
├── 忘记密码
├── 邮箱验证
└── 多因素认证（可选）
✅ 成功标准：完整的用户认证流程


阶段 5：测试和文档（1-2 天）
├── 单元测试
├── 集成测试
└── API 文档
✅ 成功标准：测试覆盖率 > 80%，文档完整

每个阶段的检查点：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
## 阶段 N 检查清单
- [ ] 代码已编写
- [ ] 所有测试通过
- [ ] 代码已审查
- [ ] 文档已更新
- [ ] 无遗留 TODO
- [ ] 性能符合预期
3. 重新提示策略（Re-prompting Strategy）

何时重新提示：

AI 的输出不符合预期
AI 误解了需求
AI 使用了过时的模式
输出质量明显下降

重新提示技巧：

增量细化
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
第一次提示：
"实现用户登录功能"


AI 产出不理想 → 第二次提示（更具体）：
"实现用户登录功能，要求：
1. 使用 JWT 而非 Session
2. 密码必须使用 bcrypt 哈希
3. 登录失败 5 次后锁定账户 15 分钟
4. 返回标准 JSON 响应格式"


仍不理想 → 第三次提示（提供示例）：
"实现用户登录功能，参考以下现有代码模式：
[粘贴类似功能的代码示例]


额外要求：
- 使用现有的 AuthService 类
- 错误处理要统一使用 handleAuthError 函数
- 添加详细的日志记录"
明确不想要的内容
ounter(lineounter(lineounter(lineounter(lineounter(line
"重新实现登录功能，但这次：
❌ 不要使用 Session，使用 JWT
❌ 不要把密码明文存储，使用 bcrypt
❌ 不要直接返回错误堆栈，使用统一错误格式
✅ 参考项目中的 signup 功能的实现模式"
4. 上下文压缩与恢复（Context Compression & Recovery）

压缩前准备：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 任务状态快照


## 当前阶段
阶段 3 / 5：实现授权中间件


## 已完成
- ✅ 数据库表和模型
- ✅ 基本认证逻辑
- ✅ JWT 生成和验证


## 进行中
- 🔄 权限检查中间件（70% 完成）
  - ✅ 基本 token 验证
  - ✅ 用户信息提取
  - ⏸️ 待完成：角色权限检查


## 下一步
1. 完成角色权限检查逻辑
2. 添加权限中间件到需要保护的路由
3. 编写中间件的单元测试


## 关键文件
- `/src/middleware/auth.ts` - 主要工作文件
- `/src/models/User.ts` - 用户模型（包含角色信息）
- `/src/utils/jwt.ts` - JWT 工具函数


## 关键决策
- 使用基于角色的访问控制（RBAC）
- 角色存储在数据库的 users.role 字段
- 支持的角色：admin, user, guest


## 待解决问题
- [ ] 如何处理同时具有多个角色的用户？

恢复时的提示词：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
我们正在继续之前的任务。请先阅读：
- /path/to/task-plan.md
- /path/to/task-context.md
- /path/to/task-tasks.md


然后继续完成"权限检查中间件"的剩余部分。
四、质量保障体系
1. 分层测试策略
单元测试（AI 高度擅长）
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
职责：测试单个函数/方法的逻辑
覆盖率目标：> 80%


AI 提示词模板：
"为以下函数生成单元测试：
[粘贴函数代码]


要求：
1. 测试正常情况
2. 测试边界条件（null、empty、极值）
3. 测试异常情况
4. 使用 [测试框架名称]
5. 遵循项目测试命名规范"
集成测试（AI 需要指导）
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
职责：测试多个组件协作
覆盖率目标：关键流程 100%


AI 提示词模板：
"为以下集成场景生成测试：
场景：用户注册到首次登录


涉及组件：
- UserController
- AuthService
- EmailService
- Database


测试流程：
1. 用户提交注册表单
2. 系统创建用户记录
3. 系统发送验证邮件
4. 用户点击验证链接
5. 用户可以成功登录


请使用项目的集成测试框架，并 mock EmailService"
E2E 测试（手动主导，AI 辅助）
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
职责：测试完整用户流程
覆盖率目标：核心业务流程 100%


开发者定义场景 → AI 实现测试代码


示例：
开发者："测试电商购物流程：
浏览商品 → 加入购物车 → 结账 → 支付 → 查看订单"


AI："我将使用 [E2E 框架] 实现这个测试：
[生成测试代码]"
2. 代码审查清单

自动检查项（工具可检测）：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
静态分析:
  - Lint 错误: 0
  - 类型错误: 0
  - 循环复杂度: < 10
  - 函数长度: < 50 行
  - 代码重复: < 5%


安全扫描:
  - 依赖漏洞: 0 严重/高危
  - 硬编码密钥: 0
  - SQL 注入风险: 0
  - XSS 风险: 0


测试:
  - 单元测试覆盖率: > 80%
  - 所有测试通过: ✅
  - 测试执行时间: < 5 分钟

人工审查项（需要判断）：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
架构和设计:
- [ ] 是否符合项目架构模式？
- [ ] 是否有适当的关注点分离？
- [ ] 是否有过度设计？
- [ ] 是否考虑了可扩展性？


业务逻辑:
- [ ] 是否正确实现了业务需求？
- [ ] 是否处理了所有边界情况？
- [ ] 是否有清晰的错误处理？
- [ ] 是否有适当的日志记录？


可维护性:
- [ ] 代码是否易于理解？
- [ ] 是否有足够的注释（复杂逻辑）？
- [ ] 命名是否清晰？
- [ ] 是否有技术债务说明？


性能:
- [ ] 是否有明显的性能问题？
- [ ] 数据库查询是否优化？
- [ ] 是否有不必要的计算？
3. 错误处理标准

分层错误处理模式：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
展示层（用户界面）
├── 捕获：所有错误
├── 显示：用户友好的错误消息
└── 上报：记录错误到监控系统


API 层
├── 捕获：路由处理器错误
├── 转换：统一错误响应格式
└── 记录：详细错误日志


业务逻辑层
├── 抛出：业务异常（如库存不足）
├── 不捕获：让上层处理
└── 验证：输入数据有效性


数据访问层
├── 捕获：数据库连接错误
├── 重试：暂时性错误
└── 抛出：持久性错误

错误处理代码模板（框架无关）：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
// 统一错误类
class ApplicationError extends Error {
  constructor(message, statusCode, errorCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}


// 业务异常示例
class InsufficientInventoryError extends ApplicationError {
  constructor(productId, requested, available) {
    super(
      'Insufficient inventory',
      400,
      'INSUFFICIENT_INVENTORY',
      { productId, requested, available }
    );
  }
}


// 错误处理中间件
function errorHandler(error, request, response, next) {
  // 记录错误
  logger.error({
    message: error.message,
    stack: error.stack,
    request: {
      method: request.method,
      url: request.url,
      body: request.body
    }
  });


  // 发送到错误追踪系统（如 Sentry）
  errorTracker.captureException(error);


  // 返回统一格式
  response.status(error.statusCode || 500).json({
    error: {
      code: error.errorCode || 'INTERNAL_ERROR',
      message: error.message,
      details: error.details || {}
    }
  });
}
五、应用到软件开发生命周期
1. 需求分析阶段

AI 辅助场景：

从用户故事生成功能需求
识别需求中的矛盾或遗漏
生成验收标准

人机协作流程：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
1. 你：提供原始需求
   "我们需要一个博客系统，用户可以发布文章"


2. AI：提问澄清
   "请确认以下假设：
   - 用户需要注册才能发布？
   - 文章是否支持富文本？
   - 是否需要评论功能？
   - 是否需要文章分类/标签？
   - 是否需要草稿功能？"


3. 你：澄清细节
   [回答 AI 的问题]


4. AI：生成结构化需求文档
   功能需求:
   - FR1: 用户注册和登录
   - FR2: 创建和编辑文章（富文本）
   - FR3: 文章分类管理
   ...


   非功能需求:
   - NFR1: 响应时间 < 200ms
   - NFR2: 支持 10,000 并发用户
   ...


5. 你：审查和调整
   [批准或修改需求]
2. UI/UX 设计阶段

AI 辅助场景：

生成基于最佳实践的界面布局
提供可访问性建议
生成交互原型代码

协作模式：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
用户旅程地图（开发者主导）
└── 线框图草图（手动绘制）
    └── 详细设计（AI 协助）
        └── 原型代码（AI 生成）
            └── 可用性测试（手动主导）
                └── 迭代优化（人机协作）


AI 提示词示例：
"根据以下线框图，生成符合 WCAG 2.1 AA 标准的 HTML/CSS 代码：
[描述或附上线框图]


要求：
- 响应式设计（移动优先）
- 语义化 HTML
- 适当的 ARIA 标签
- 键盘导航支持
- 颜色对比度 > 4.5:1"

常见 UI 模式库（AI 可直接使用）：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
数据展示:
- 表格（排序、筛选、分页）
- 卡片网格
- 列表（虚拟滚动）


表单:
- 多步骤表单
- 实时验证
- 自动保存


反馈:
- Toast 通知
- 模态对话框
- 加载状态
3. 架构设计阶段

AI 辅助场景：

提供架构模式建议
生成架构决策记录（ADR）
识别架构风险

开发者主导的部分：

最终方案选择
成本效益分析
团队能力评估

关键决策点：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 架构决策记录模板（AI 可协助填写）


## ADR-001: 选择前后端分离架构


### 状态
已接受


### 背景
我们需要选择应用架构模式。考虑了以下选项：
1. 单体架构（前后端一体）
2. 前后端分离
3. 微服务架构


### 决策
选择前后端分离架构


### 理由
优势：
- ✅ 前后端可独立开发和部署
- ✅ 更好的关注点分离
- ✅ 便于多端复用（Web + 移动端）
- ✅ 技术栈选择更灵活


劣势（可接受）：
- ⚠️ 需要处理跨域问题
- ⚠️ 部署稍复杂
- ⚠️ 开发初期需要 mock 数据


替代方案不适合的原因：
- 单体架构：不利于团队并行开发
- 微服务：当前团队规模和复杂度不需要


### 影响
- 前端使用 React 独立开发
- 后端提供 RESTful API
- 使用 JWT 进行身份验证
- 需要配置 CORS


### 相关决策
- ADR-002: API 设计规范
- ADR-003: 前端状态管理方案

AI 提示词：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
"请分析以下场景，提供架构建议：


项目背景：
- 电商平台
- 预期用户：10 万日活
- 核心功能：商品浏览、下单、支付
- 团队：5 人（3 后端 + 2 前端）


请提供：
1. 推荐的架构模式（单体/微服务/无服务器）
2. 技术栈建议
3. 数据库选型
4. 缓存策略
5. 扩展性考虑


对每个建议说明理由和权衡。"
4. 技术方案设计阶段

AI 擅长的部分：

生成详细的技术实施方案
提供多个方案对比
识别技术风险

开发者主导的部分：

最终方案选择
成本效益分析
团队能力评估

技术方案文档模板：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 技术方案：[功能名称]


## 1. 需求概述
[简要描述要解决的问题]


## 2. 技术方案


### 方案 A：[方案名称]
**技术栈**：[列出技术]


**架构图**：
[ASCII 图或 Mermaid 图]


**实施步骤**：
1. [步骤 1]
2. [步骤 2]
...


**优势**：
- ✅ [优势 1]
- ✅ [优势 2]


**劣势**：
- ❌ [劣势 1]
- ❌ [劣势 2]


**风险**：
- ⚠️ [风险 1]：缓解措施 [...]
- ⚠️ [风险 2]：缓解措施 [...]


**工时估算**：[X] 人天


### 方案 B：[备选方案]
[同样的结构]


## 3. 方案对比


| 维度       | 方案 A | 方案 B |
|-----------|--------|--------|
| 开发成本   | 中     | 高     |
| 维护成本   | 低     | 中     |
| 性能      | 优     | 良     |
| 可扩展性   | 良     | 优     |
| 团队熟悉度 | 高     | 低     |


## 4. 推荐方案
[选择 X 方案]，理由：
1. [理由 1]
2. [理由 2]


## 5. 实施计划
[详细的阶段划分和时间表]


## 6. 风险缓解
[针对推荐方案的风险及应对措施]

AI 协助流程：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
你："我需要实现用户头像上传功能，请提供技术方案"


AI："我提供三个方案：
方案 1: 直接上传到应用服务器
方案 2: 上传到对象存储（如 S3）
方案 3: 使用 CDN + 对象存储


[详细展开每个方案]


请问您更关注哪些方面？成本/性能/简单性"


你："主要关注成本和简单性，团队没有 AWS 经验"


AI："基于您的优先级，推荐方案 1（服务器直传）+ 未来可升级到方案 2。
理由：
- 开发最简单
- 无额外服务成本
- 可以后期平滑迁移到对象存储
- 对于 < 10 万用户足够
[提供详细实施步骤]"
5. 前端开发阶段

AI 高效场景：

组件代码生成
样式实现
状态管理设置
路由配置

最佳实践：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
1. 从设计系统开始
   你："我们使用 Material-UI v5"
   AI：[生成符合 MUI 规范的代码]


2. 组件驱动开发
   你："创建一个用户卡片组件，显示头像、姓名、简介"
   AI：[生成组件 + Storybook 故事]


3. 逐步添加交互
   你："添加点击卡片跳转到详情页的功能"
   AI：[添加路由跳转逻辑]


4. 集成状态管理
   你："用户信息从全局状态获取，使用 Redux"
   AI：[添加 Redux 连接代码]

前端提示词模式：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
功能性提示词：
"创建一个 [组件类型]，功能包括：
1. [功能 1]
2. [功能 2]


技术要求：
- 使用 [框架/库]
- 遵循 [设计系统]
- 支持 [可访问性要求]"


样式提示词：
"为以下组件添加样式：
[组件代码]


设计要求：
- 符合 [设计规范]
- 响应式（移动/平板/桌面）
- 深色模式支持
- 动画效果：[描述]"


性能提示词：
"优化以下组件的性能：
[组件代码]


问题：
- 不必要的重渲染
- 大列表未虚拟化
- 图片未懒加载


请使用 React.memo、useMemo、useCallback 等优化"
6. 后端开发阶段

AI 高效场景：

API 路由定义
数据库 schema 设计
业务逻辑实现
中间件编写

分层开发策略：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
1. 数据层
   └── 定义 schema → AI 生成迁移文件
       └── 创建模型 → AI 生成 ORM 模型
           └── 编写查询 → AI 生成仓储方法


2. 业务层
   └── 定义服务接口 → 你来设计
       └── 实现业务逻辑 → AI 实现
           └── 添加验证 → AI 添加


3. API 层
   └── 定义路由 → 你来设计
       └── 实现控制器 → AI 实现
           └── 添加验证和错误处理 → AI 添加


4. 横切关注点
   ├── 认证中间件 → AI 实现（基于模式）
   ├── 日志记录 → AI 实现
   ├── 错误处理 → AI 实现
   └── 性能监控 → AI 配置

后端提示词模式：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
数据库设计：
"为以下实体设计数据库 schema：
实体：[实体名称]
字段：[字段列表及类型]
关系：[与其他实体的关系]


要求：
- 使用 [数据库类型]
- 添加适当的索引
- 考虑数据完整性约束
- 考虑查询性能"


API 设计：
"设计 RESTful API 用于 [资源名称]


操作：
- 列表查询（支持分页、排序、筛选）
- 详情查询
- 创建
- 更新
- 删除


要求：
- 遵循 REST 最佳实践
- 定义请求/响应格式
- 说明错误码
- 考虑并发控制"


业务逻辑：
"实现以下业务逻辑：
[描述业务规则]


要求：
- 验证输入
- 处理边界情况
- 事务管理
- 错误处理
- 记录审计日志"
7. 软件测试阶段

AI 测试生成策略：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
测试金字塔（AI 参与度）:


        E2E 测试
       (AI 辅助 30%)
           /\
          /  \
         /    \
        /      \
    集成测试
   (AI 主导 60%)
      /        \
     /          \
    /            \
   /              \
  单元测试
(AI 主导 90%)


AI 参与度说明：
- 单元测试：AI 几乎可以完全自动生成
- 集成测试：AI 需要你提供场景，然后实现
- E2E 测试：你定义关键路径，AI 实现测试代码

测试生成提示词：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
单元测试：
"为以下函数生成全面的单元测试：
[粘贴函数代码]


覆盖场景：
- 正常输入
- 边界值（0, 负数, 最大值）
- 异常输入（null, undefined, 错误类型）
- 错误处理


使用 [测试框架] 和 [断言库]"


集成测试：
"为以下 API 端点生成集成测试：
端点：POST /api/users
功能：创建新用户


测试场景：
1. 成功创建用户
2. 邮箱已存在（409 错误）
3. 无效输入（400 错误）
4. 未授权（401 错误）


使用 [HTTP 客户端] 和测试数据库"


E2E 测试：
"创建 E2E 测试用于以下用户流程：
1. 访问首页
2. 点击注册按钮
3. 填写注册表单
4. 提交并验证邮箱
5. 登录
6. 访问个人中心


使用 [E2E 框架]，考虑以下：
- 等待页面加载
- 处理异步操作
- 截图断言
- 失败时自动重试"

测试数据管理：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
// AI 可以生成符合 schema 的测试数据工厂


// 提示词：
// "生成用户测试数据工厂，支持自定义属性覆盖"


// AI 生成：
const UserFactory = {
  build: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    role: 'user',
    createdAt: new Date(),
    ...overrides
  }),


  buildMany: (count, overrides = {}) => {
    return Array.from({ length: count }, () =>
      UserFactory.build(overrides)
    );
  }
};


// 使用
const testUser = UserFactory.build({ role: 'admin' });
const users = UserFactory.buildMany(10);
8. 工程部署阶段

AI 辅助场景：

生成 CI/CD 配置
编写部署脚本
创建容器化配置
设置监控告警

部署提示词模式：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
Docker 容器化：
"为以下应用创建 Dockerfile 和 docker-compose.yml：


应用类型：[Node.js/Python/Java 等]
依赖：[列出主要依赖]
端口：[端口号]
环境变量：[列表]


要求：
- 多阶段构建优化镜像大小
- 非 root 用户运行
- 健康检查
- 日志输出到 stdout"


CI/CD 流水线：
"创建 GitHub Actions 工作流用于：


流程：
1. 代码检查（lint）
2. 运行测试
3. 构建 Docker 镜像
4. 推送到镜像仓库
5. 部署到 [环境]


触发条件：
- 推送到 main 分支
- PR 提交


要求：
- 使用缓存加速
- 失败时通知
- 并行运行测试"


Kubernetes 部署：
"创建 K8s 部署配置：


应用：[应用名称]
副本数：3
资源限制：
- CPU: 500m
- 内存: 512Mi


要求：
- 滚动更新策略
- 健康检查探针
- 环境变量从 ConfigMap/Secret
- 服务暴露（ClusterIP/LoadBalancer）"

基础设施即代码（IaC）：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
提示词：
"使用 Terraform 创建以下 AWS 基础设施：


资源：
- VPC with public/private subnets
- RDS PostgreSQL 实例
- ElastiCache Redis
- Application Load Balancer
- ECS Fargate 集群


要求：
- 多可用区部署
- 安全组配置
- 自动备份
- 监控告警"


AI 会生成：
- main.tf（主要资源定义）
- variables.tf（变量定义）
- outputs.tf（输出值）
- terraform.tfvars.example（变量示例）
9. 软件开发工作流阶段

Git 工作流优化：

ounter(lineounter(lineounter(lineounter(lineounter(line
AI 辅助场景：
1. 生成有意义的 commit message
2. 创建 PR 描述
3. 生成 changelog
4. 检测代码冲突

Commit Message 生成：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
提示词：
"根据以下代码变更生成 commit message：
[git diff 输出]


遵循 Conventional Commits 规范：
- feat: 新功能
- fix: Bug 修复
- docs: 文档更新
- refactor: 重构
- test: 测试
- chore: 构建/工具


格式：
<type>(<scope>): <subject>


<body>


<footer>"


AI 输出示例：
feat(auth): implement JWT-based authentication


- Add JWT token generation and validation
- Create authentication middleware
- Add user login/logout endpoints
- Update user model with password hashing


Closes #123

PR 描述生成：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
提示词：
"为以下代码变更创建 Pull Request 描述：


变更的文件：[文件列表]
相关 issue：#[issue 号]


生成包含：
1. 变更摘要
2. 技术细节
3. 测试说明
4. 截图（如果是 UI 变更）
5. 检查清单"


AI 生成：
## 变更摘要
实现了基于 JWT 的用户认证系统


## 技术细节
- 使用 bcrypt 哈希密码
- JWT token 有效期 24 小时
- Refresh token 有效期 7 天
- 集成到现有用户系统


## 测试
- ✅ 单元测试覆盖率 85%
- ✅ 集成测试通过
- ✅ 手动测试登录/登出流程


## 检查清单
- [x] 代码遵循项目规范
- [x] 添加了测试
- [x] 更新了文档
- [x] 无遗留 TODO
- [x] 通过了 CI 检查
10. 软件工程项目管理阶段

AI 辅助项目管理：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
工时估算：
提示词：
"估算以下任务的工时：
[任务描述]


考虑因素：
- 设计时间
- 开发时间
- 测试时间
- Code Review
- 文档编写
- Buffer（不确定性）


提供：
- 最佳情况
- 最可能情况
- 最坏情况
- 推荐估算（考虑风险）"


风险识别：
提示词：
"识别以下项目的技术风险：
[项目描述]


分析：
- 技术风险（新技术、复杂度）
- 依赖风险（第三方服务、团队）
- 时间风险（估算不准、范围蔓延）
- 资源风险（人员、技能）


对每个风险提供：
- 影响程度（高/中/低）
- 发生概率（高/中/低）
- 缓解措施"

项目文档生成：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
技术文档：
- API 文档（从代码注释生成）
- 架构文档（从代码结构生成）
- 部署文档（从配置生成）
- 开发指南（从最佳实践整理）


用户文档：
- 用户手册（AI 根据功能生成草稿）
- FAQ（AI 从常见问题整理）
- 教程（AI 根据用户旅程生成）
- Release Notes（AI 从 commits 生成）

代码统计和报告：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
提示词：
"分析代码库并生成项目健康报告：


分析维度：
- 代码行数和复杂度
- 测试覆盖率
- 技术债务（TODO, FIXME）
- 依赖健康度（过时的依赖）
- 安全漏洞
- 性能瓶颈


生成包含：
- 执行摘要
- 详细指标
- 改进建议
- 优先级排序"
六、常见陷阱与解决方案
1. 过度依赖 AI

症状：

不理解 AI 生成的代码就直接使用
AI 出错后不知道如何调试
失去了编码的基本能力

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
黄金规则：永远不要使用你不理解的代码


实践：
1. AI 生成代码后，逐行阅读理解
2. 不理解的部分，要求 AI 解释
3. 对关键逻辑，尝试自己重写一遍验证理解
4. 定期进行不使用 AI 的编码练习


示例提示词：
"请解释以下代码的工作原理，就像我是初学者一样：
[代码片段]


特别解释：
- 这个算法的时间复杂度是什么？
- 为什么选择这个数据结构？
- 有没有潜在的边界情况？"
2. 上下文丢失

症状：

AI 忘记了之前的讨论
AI 推翻了之前做出的决策
AI 产生与现有代码不一致的代码

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：显式引用历史上下文
"根据我们之前讨论的使用 JWT 认证的决定，现在实现登录端点"


策略 2：维护上下文文档
每个会话开始时：
"请先阅读以下上下文文档：
- /docs/project-context.md
- /docs/current-task.md
然后继续工作"


策略 3：定期总结
每完成一个里程碑：
"请总结我们到目前为止：
- 完成的功能
- 做出的技术决策
- 遗留的问题
将总结保存到 /docs/progress.md"


策略 4：使用结构化的任务跟踪
维护 plan.md、context.md、tasks.md 三文件系统
3. 质量下降

症状：

AI 生成的代码质量波动大
有时产出优秀代码,有时产出糟糕代码
不遵循既定的规范

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：建立质量检查点
每次 AI 生成代码后：
- [ ] 运行 lint 检查
- [ ] 运行类型检查
- [ ] 运行测试
- [ ] Code review（人工或另一个 AI）


策略 2：使用技能/规则系统
创建项目规范文档，每次提示时引用：
"遵循 /docs/coding-standards.md 中的规范"


策略 3：重新提示
如果输出质量不佳：
"之前的实现有以下问题：
1. [问题 1]
2. [问题 2]


请重新实现，特别注意：
- [具体要求 1]
- [具体要求 2]"


策略 4：提供示例
"参考以下现有代码的风格和模式：
[粘贴高质量代码示例]


现在实现 [新功能]"
4. 安全隐患

症状：

AI 生成包含安全漏洞的代码
硬编码敏感信息
缺少输入验证

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：安全检查清单
每次涉及以下场景时强制检查：
- [ ] 用户输入 → 验证和清理
- [ ] 数据库查询 → 参数化查询
- [ ] 密码处理 → 哈希+盐
- [ ] API 调用 → 认证和授权
- [ ] 文件操作 → 路径验证
- [ ] 敏感数据 → 加密


策略 2：明确安全要求
提示词中包含安全要求：
"实现用户注册功能，必须满足：
- 密码使用 bcrypt 哈希（cost factor 12）
- 邮箱必须验证格式和唯一性
- 防止 SQL 注入
- 防止暴力破解（限流）
- 记录安全审计日志"


策略 3：自动安全扫描
集成到 CI/CD：
- SAST（静态应用安全测试）
- 依赖漏洞扫描
- Secret 检测工具


策略 4：安全代码审查
对涉及认证、授权、支付等关键功能：
- 人工安全审查（必须）
- 使用专门的安全审查 AI 代理
5. 技术债务累积

症状：

AI 倾向于"快速解决"而非"正确解决"
大量 TODO 和 FIXME
缺少重构

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：定义"完成"标准
每个任务的完成标准：
- [ ] 功能实现
- [ ] 测试编写
- [ ] 文档更新
- [ ] Code review 通过
- [ ] 无技术债务标记（TODO/FIXME/HACK）


策略 2：定期重构
每个 sprint 分配 20% 时间用于重构：
"识别 [模块名] 中的代码异味：
- 重复代码
- 过长函数
- 复杂的条件逻辑
- 不清晰的命名


提供重构建议和优先级"


策略 3：技术债务可视化
使用工具或 AI 生成报告：
"扫描代码库并生成技术债务报告：
- TODO/FIXME 统计
- 圈复杂度超过 10 的函数
- 重复代码块
- 过时的依赖


按影响程度排序"


策略 4：在提示词中强调质量
"实现 [功能]，要求：
✅ 清晰的代码结构
✅ 单一职责原则
✅ DRY（不要重复）
✅ 适当的抽象层次
❌ 不要留下 TODO
❌ 不要硬编码
❌ 不要复制粘贴代码"
6. 测试不足

症状：

AI 只写代码不写测试
测试覆盖率低
测试质量差（只测试快乐路径）

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：TDD（测试驱动开发）
提示词模式：
"我需要实现 [功能]


步骤 1: 先编写测试
请为以下场景编写测试：
- 正常情况
- 边界情况
- 异常情况


步骤 2: 实现功能
让测试通过的最简实现


步骤 3: 重构
保持测试通过的前提下优化代码"


策略 2：测试覆盖率要求
"实现 [功能]，要求：
- 单元测试覆盖率 > 90%
- 所有公共方法必须测试
- 所有错误处理路径必须测试
- 使用 [测试框架]"


策略 3：测试审查
使用测试审查 AI 代理：
"审查以下测试，检查：
- [ ] 是否测试了所有分支？
- [ ] 是否测试了边界条件？
- [ ] 是否测试了错误处理？
- [ ] 测试是否独立（不依赖执行顺序）？
- [ ] 断言是否具体明确？"


策略 4：集成测试生成
"为以下 API 生成集成测试：
[API 规范]


测试场景包括：
- 成功路径（2xx 响应）
- 客户端错误（4xx）
- 服务器错误（5xx）
- 认证/授权检查
- 数据验证
- 并发安全"
7. 文档缺失或过时

症状：

代码有,文档无
文档与实际代码不一致
新人难以上手

解决方案：

ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
策略 1：代码即文档
使用清晰的命名和适当的注释：
"重构以下代码，使其自文档化：
[代码]


要求：
- 使用描述性的变量/函数名
- 提取魔法数字为常量
- 复杂逻辑添加注释
- 不明显的业务规则添加说明"


策略 2：自动文档生成
"从以下代码生成 API 文档：
[代码]


格式：
- 端点描述
- 请求参数（类型、必填、示例）
- 响应格式（成功和错误）
- 示例请求/响应
- 可能的错误码"


策略 3：文档同步检查
将文档更新纳入完成标准：
"实现 [功能] 后，更新以下文档：
- [ ] API 文档（如果是 API 变更）
- [ ] 架构图（如果是架构变更）
- [ ] README（如果影响使用方式）
- [ ] CHANGELOG（记录变更）"


策略 4：文档审查
定期让 AI 审查文档：
"检查以下文档是否与代码一致：
[文档]


对应代码：[代码路径]


报告：
- 不一致的地方
- 缺失的说明
- 过时的示例
- 改进建议"
七、总结：AI 辅助开发的核心原则
1. 规划先行
永远先规划再编码
将大任务分解为小阶段
明确成功标准
2. 上下文管理
使用分层文档（轻量 + 详细）
维护任务上下文（plan + context + tasks）
定期总结和持久化关键信息
3. 质量保障
建立自动化质量门控
要求 AI 自我审查
开发者把控关键决策
4. 知识复用
封装最佳实践为技能/规则
建立模式库和模板
自动激活相关知识
5. 人机协作
明确 AI 擅长和不擅长的场景
开发者主导战略，AI 执行战术
三次失败规则：及时介入
6. 持续改进
收集 AI 的优秀输出作为示例
识别常见问题并完善提示词
优化工作流程
八、附录：通用提示词模板库
A. 需求分析模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 需求分析请求


## 原始需求
[粗略的需求描述]


## 请执行
1. 提出澄清问题（至少 5 个）
2. 识别隐含需求
3. 生成结构化需求文档
   - 功能需求
   - 非功能需求
   - 约束条件
4. 提供验收标准


## 输出格式
使用用户故事格式：
作为 [角色]
我想要 [功能]
以便于 [价值]


验收标准：
- [ ] [标准 1]
- [ ] [标准 2]
B. 架构设计模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 架构设计请求


## 系统概述
- 项目类型：[Web/移动/桌面/...]
- 预期规模：[用户数/数据量/...]
- 核心功能：[列表]
- 团队情况：[人数/技能]


## 请提供
1. 推荐的架构模式（3 个选项）
2. 技术栈建议
3. 数据存储方案
4. 架构图（Mermaid 或 ASCII）
5. 关键决策的权衡分析


## 重点考虑
- [ ] 可扩展性
- [ ] 可维护性
- [ ] 性能
- [ ] 安全性
- [ ] 成本
C. 代码实现模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 代码实现请求


## 功能描述
[清晰描述要实现的功能]


## 技术约束
- 编程语言：[语言]
- 框架/库：[列表]
- 必须遵循：[现有模式/规范]


## 要求
- [ ] 遵循 [编码规范]
- [ ] 包含错误处理
- [ ] 添加适当的注释
- [ ] 编写单元测试
- [ ] 性能要求：[具体指标]


## 参考
现有类似实现：[文件路径或代码片段]
D. 代码审查模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 代码审查请求


## 审查范围
[文件列表或代码片段]


## 审查维度
- [ ] 正确性（逻辑正确）
- [ ] 安全性（无漏洞）
- [ ] 性能（无明显瓶颈）
- [ ] 可维护性（清晰易懂）
- [ ] 测试（覆盖充分）
- [ ] 规范（遵循标准）


## 输出要求
### 必须修复
[严重问题列表]


### 建议改进
[优化建议列表]


### 优点
[值得保持的好做法]
E. 测试生成模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 测试生成请求


## 被测代码
[代码片段或文件路径]


## 测试要求
- 测试框架：[框架名称]
- 覆盖率目标：[百分比]
- 重点场景：
  - [ ] 正常路径
  - [ ] 边界条件
  - [ ] 异常处理
  - [ ] 并发安全（如适用）


## 测试数据
- 使用 fixture：[是/否]
- 需要 mock：[列出需要 mock 的依赖]


## 输出要求
- 清晰的测试描述
- 独立的测试（不依赖执行顺序）
- 明确的断言
F. 文档生成模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# 文档生成请求


## 文档类型
[API 文档/用户指南/开发文档/...]


## 源材料
[代码文件/现有文档/...]


## 目标受众
[开发人员/最终用户/运维人员/...]


## 内容要求
- [ ] 概述·
- [ ] 详细说明
- [ ] 代码示例
- [ ] 常见问题
- [ ] 故障排除


## 格式
[Markdown/HTML/PDF/...]
结语

AI 辅助开发不是让 AI 替代开发人员，而是让开发人员成为更高效的工程师。关键是：

保持主动：你设定目标，AI 帮助实现
保持批判：审查 AI 的输出，不盲目信任
保持学习：理解 AI 生成的代码，提升自己
保持迭代：不断优化提示词和工作流

AI 是工具，你是工匠。工具再好，也需要工匠的智慧和经验来发挥其最大价值。

我是易安，一位专注AI技术研究的AI超级个体。每天为大家带来前沿AI工具评测和实践经验，用通俗易懂的方式解读复杂的技术概念，👇长按扫码关注，一起探索AI技术的无限可能！




如果觉得我的文章对你有帮助的话，可以帮我点个赞👍或者喜欢❤，让更多跟你一样好品味的人看到这些内容，感谢🙏




推荐阅读


来，这是易安的介绍（第2版，交个朋友，限时送福利）
我和深圳大冲的故事

---
*导入时间: 2026-01-17 21:20:39*
