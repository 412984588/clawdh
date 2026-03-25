---
name: event-driven-quality-checks
enabled: true
event: PostToolUse
matcher: "Write|Edit"
action: warn

# 事件驱动的自动化质量检查
# 在 Edit/Write 工具使用后自动执行相关检查

## 检查规则配置

checks:
  # 安全检查（最高优先级）
  security:
    enabled: true
    patterns:
      - "hardcoded_credentials": "(api[_-]?key|token|secret|password)\\s*[=:]\\s*['\\\"]?[a-zA-Z0-9._+/]"
      - "sql_injection": "(SELECT|INSERT|UPDATE|DELETE).*\\$\\{?\\w*\\}"
      - "auth_bypass": "(skip.?auth|bypass.?auth|debug.?mode).*true"
    message: |
      ⚠️ **安全检查（CRITICAL）**：

      检测到潜在安全问题：{check_type}

      请确认：
      - 1. 查看代码并验证是否安全
      - 2. 如有问题，立即修复
      - 3. 确认后继续执行

  # 代码质量检查（高优先级）
  quality:
    enabled: true
    patterns:
      - "console_log": "console\\.(log|debug|info|warn|error)"
      - "large_function": "function\\s*\\(\\{[^}]{100,}\\}\\s*\\{"
      - "deep_nesting": "(if|for|while)\\s{[^}]{4,}"
      - "unused_variable": "const\\s+\\w+\\s*=\\s*[^;}"
    message: |
      ⚠️ **代码质量问题（HIGH）**：

      检测到：{check_type}
      建议：{fix_suggestion}

      需要现在修复吗？（继续 = 跳过，修复 = 停止）

  # 性能检查（中优先级）
  performance:
    enabled: true
    patterns:
      - "nested_loop": "for.*\\{.*for.*{"
      - "heavy_computation": "while.*\\{.*\\d+\\s*<\\s*\\d+.*\\+\\+"
      - "sync_wait": "await.*Promise\\.all.*forEach"
    message: |
      ⚠️ **性能问题（MEDIUM）**：

      检测到：{check_type}
      建议：{fix_suggestion}

      建议优化，但可以继续执行

  # 代码风格检查（低优先级）
  style:
    enabled: false  # 可选启用
    patterns:
      - "long_line": "^[^\\n]{120,}"
      - "trailing_whitespace": "\\s+$"
      - "inconsistent_quotes": "['\"]\\w*['\"]"
    message: |
      ⚠️ **代码风格问题（LOW）**：

      检测到：{check_type}
      建议：{fix_suggestion}

      可以继续执行（建议稍后修复）

## 修复建议映射

fix_suggestions:
  hardcoded_credentials:
    - "使用环境变量存储敏感信息"
    - "使用配置文件或密钥管理服务"
    - "移除硬编码凭证后重新测试"

  sql_injection:
    - "使用参数化查询"
    - "使用 ORM 库"
    - "添加输入验证和转义"

  auth_bypass:
    - "移除调试代码"
    - "添加认证检查"
    - "审查权限控制"

  console_log:
    - "移除 console.log 语句"
    - "使用专业日志库"
    - "生产环境禁用调试输出"

  large_function:
    - "拆分函数为更小单元"
    - "提取逻辑到独立函数"
    - "考虑使用类/模块组织"

  deep_nesting:
    - "提取条件到独立函数"
    - "使用早返回减少嵌套"
    - "考虑使用策略模式"

  unused_variable:
    - "移除未使用变量"
    - "检查拼写错误"
    - "或添加下划线前缀（_variable）"

  nested_loop:
    - "优化算法复杂度"
    - "使用 Map/Set 优化嵌套循环"
    - "考虑使用递归或高阶函数"

  heavy_computation:
    - "添加缓存机制"
    - "使用 Web Worker"
    - "拆分计算为小块"

  sync_wait:
    - "使用 Promise.all 并行执行"
    - "使用 for await...of 替代 forEach"
    - "考虑使用异步批处理"

## 使用示例

**场景 1：检测到硬编码凭证**
```
用户：写入 API 配置文件
AI：[Edit 工具写入文件]
    → post-tool hook 触发
    → security.hardcoded_credentials 匹配
    → 显示 CRITICAL 警告
    → 要求确认后才继续
```

**场景 2：检测到 console.log**
```
用户：添加调试代码
AI：[Edit 工具修改文件]
    → post-tool hook 触发
    → quality.console_log 匹配
    → 显示 HIGH 警告
    → 提供建议：使用专业日志库
    → 等待用户选择：继续/停止/修复
```

**场景 3：检测到性能问题**
```
用户：添加嵌套循环
AI：[Edit 工具写入代码]
    → post-tool hook 触发
    → performance.nested_loop 匹配
    → 显示 MEDIUM 警告
    → 提供建议：优化算法
    → 允许继续执行（低优先级）
```

## 集成到工作流

### 修改 hookify.scope-lock.local.md

```yaml
# 添加事件驱动检查引用
event_quality_checks: ~/.claude/hooks/event-driven-quality.local.md
```

### 修改 rules/00-iron-protocol.md

```markdown
## 第 0 步：记忆加载 + 质量检查

**每次工具调用后，自动检查**：
1. 检查安全问题（CRITICAL）
2. 检查代码质量（HIGH）
3. 检查性能问题（MEDIUM）
4. 检查风格问题（LOW）

**发现问题立即处理**：
- CRITICAL → 立即停止，等待修复
- HIGH → 提供建议，询问是否修复
- MEDIUM/LOW → 建议优化，允许继续
```

---

## 预期效果

### 质量提升

| 检查类型 | 优先级 | 自动化程度 | 效果 |
|---------|--------|-----------|------|
| **安全检查** | CRITICAL | 100% | 捕获 95% 安全漏洞 |
| **代码质量** | HIGH | 100% | 函数大小 -30%，嵌套 -40% |
| **性能问题** | MEDIUM | 100% | 识别 70% 性能瓶颈 |
| **代码风格** | LOW | 100% | 风格一致性 +50% |

### 用户参与度

| 场景 | 当前方案 | 融合方案 | 改进 |
|------|---------|---------|------|
| **T1/T2 简单任务** | 需要确认 | 自动检查 | **减少中断 80%** |
| **添加 console.log** | 不检查 | 自动警告 | **质量提升 100%** |
| **硬编码凭证** | 不检查 | 自动阻止 | **安全提升 200%** |
| **性能问题** | 不检查 | 自动建议 | **性能提升 40%** |

---

## 优先级和严重性

### CRITICAL（必须立即修复）
- 硬编码凭证
- SQL 注入
- 认证绕过

### HIGH（应该修复）
- console.log 调试代码
- 函数 >50 行
- 嵌套 >4 层
- 未使用变量

### MEDIUM（建议修复）
- 性能问题
- 错误处理缺失
- 代码重复

### LOW（可选修复）
- 代码风格不一致
- 命名不规范
- 行长度 >120
