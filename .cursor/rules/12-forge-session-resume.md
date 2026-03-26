---
alwaysApply: true
---

# Forge 会话恢复协议

## 规则

**每次会话开始时**，检查是否有进行中的 Forge 项目：

```
~/.forge/signals/active-projects.md
```

### 检查流程

1. 用 `cat ~/.forge/signals/active-projects.md 2>/dev/null` 读取文件
2. 如果文件不存在 → 无进行中项目，正常继续
3. 如果文件存在且有内容：
   - 以**中文**告知用户有进行中的项目
   - 列出项目名称、当前阶段、以及质量门状态（如文件中有 `已通过:`/`进行中:` 标注）
   - 提供恢复命令（格式：`/forge resume {项目名}`）
4. **等待用户决定**是否恢复，不要自动恢复

### 获取完整状态（恢复时）

如用户选择恢复，读取项目 bridge 文件获取详细的质量门状态：

```bash
cat {project_path}/.planning/.forge-bridge.json 2>/dev/null
```

其中 `gates` 字段包含所有质量门的完整状态：
- `passed` — 已通过
- `failed` — 已失败
- `leased` — 进行中（已分配给某个 agent）
- `idle` — 未开始

### 输出格式示例

```
检测到进行中的 Forge 项目：

• 番茄计时器（第 2/5 阶段，已通过: tests, code_review）— 恢复：/forge resume 番茄计时器

需要继续这个项目吗？
```

### 注意

- 只在会话**开始**检查一次
- 不要重复提示
- 如果用户已经在工作中（上下文有多条消息），跳过此检查
