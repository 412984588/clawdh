---
name: autonomous-fix
enabled: true
event: PostToolUse
matcher: Bash
condition: "exit_code != 0"
action: auto_fix

# 最多修复尝试次数
max_attempts: 3

# 失败后是否回滚代码
rollback_on_failure: true

# 修复策略
strategies:
  - syntax_error        # 语法错误
  - missing_import     # 缺失导入
  - type_mismatch      # 类型不匹配
  - null_reference     # 空引用错误
  - logic_error        # 逻辑错误
  - api_error          # API调用错误
  - async_error       # 异步处理错误

# 回滚配置
rollback:
  backup_before_fix: true
  restore_on_max_attempts: true
  notify_user: true

# 统计（可选）
statistics:
  track_success_rate: true
  track_fix_duration: true
  log_all_attempts: true
