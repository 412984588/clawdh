---
title: "给ClaudeCode 套上缰绳，精准把控产出"
source: wechat
url: https://mp.weixin.qq.com/s/BDvrMUHzJUlP0UvWH9PPpA
author: 南蛮书心
pub_date: 2025年8月17日 12:00
created: 2026-01-17 22:43
tags: [AI, 编程, 产品]
---

# 给ClaudeCode 套上缰绳，精准把控产出

> 作者: 南蛮书心 | 发布日期: 2025年8月17日 12:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/BDvrMUHzJUlP0UvWH9PPpA)

---

Claude Code 使用心得：你知道它会怎么干，它知道你要什么
上次说了使用原则，但是每一次都要教育它也挺烦的，可以直接把工作流程添加到配置里。
在项目的根目录下添加一个 CLAUDE.md 文件
添加内容：

 

# 代码修改工作流程

## 核心原则
**双向充分理解**: 让Claude充分了解用户需求，让用户充分了解Claude的实施方案

## 详细流程

### 阶段1：需求理解
1. **用户**：提出需求
2. **Claude**：
   - 复述需求，确保理解准确
   - 主动提出疑问和澄清问题
3. **用户**：回复疑问，提供补充信息
4. **Claude**：基于回复重新复述需求
5. **重复步骤2-4**：直到Claude完全理解用户意图，无任何疑问

### 阶段2：方案设计
1. **Claude**：提供详细实施方案，包括：
   - 修改的文件列表
   - 具体改动内容
   - 实施逻辑说明
   - 可能的影响分析
2. **用户**：审核方案，提出修改意见
3. **Claude**：根据意见调整和完善方案
4. **重复步骤2-3**：直到用户对方案完全满意

### 阶段3：执行确认
1. **用户**：明确表示"同意实施"/"开始执行"/"确认"
2. **Claude**：执行代码修改

## 执行原则
- **绝对禁止**：未经完整流程确认，不得进行任何代码修改
- **充分沟通**：每个阶段都要确保双方理解一致
- **用户主导**：所有决策权在用户，Claude只有建议权

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

---
*导入时间: 2026-01-17 22:43:42*
