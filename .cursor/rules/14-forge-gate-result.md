---
alwaysApply: true
---

# Forge 质量门结果回写协议

## 规则

**每次执行完质量门任务后**（/review、/qa、/cso 等），必须立即写入结果信号文件。

这是 Forge 流水线的闭环机制——没有回写，质量门永远卡在"进行中"状态。

### 何时触发

以下任务**执行完毕后**立即写入：

| 执行的任务 | gate_name |
|-----------|-----------|
| `/review` 或 `gstack /review` | `code_review` |
| `/qa` 或 `gstack /qa` | `qa` |
| `/cso` 或 `gstack /cso` | `security` |
| `next-gate.json` 中指定的其他任务 | 使用 `gate_name` 字段的原始值 |

### 写入步骤

```bash
# 1. 确保目录存在
mkdir -p .planning/.cursor-signals/

# 2. 写入结果文件（替换 <值> 部分）
cat > .planning/.cursor-signals/gate-result.json << 'GATE_EOF'
{
  "gate_name": "<实际的 gate_name>",
  "result": "<passed 或 failed>",
  "written_at": "<ISO 8601 时间，如 2026-03-26T12:00:00.000Z>",
  "cwd": "<项目根目录绝对路径>"
}
GATE_EOF
```

获取当前时间：`date -u +%Y-%m-%dT%H:%M:%S.000Z`
获取项目根目录：`git rev-parse --show-toplevel 2>/dev/null || pwd`

### result 判断标准

- `passed`：任务完成，无阻断问题（或已修复所有发现的问题）
- `failed`：任务发现了**未解决**的严重问题

### 执行顺序

1. 收到 `next-gate.json` 信号 → 执行指定的质量门任务
2. 修复任务发现的问题
3. 写入 `gate-result.json`（反映修复后的最终状态）
4. 删除 `next-gate.json`：`rm -f .planning/.cursor-signals/next-gate.json`
5. 继续被中断的原始任务

### 注意

- `gate-result.json` 写入后**不需要**手动删除，hook 会自动消费并清理
- 如果是从 `next-gate.json` 触发的，`gate_name` 必须与 `next-gate.json` 中的 `gate_name` 字段完全一致
