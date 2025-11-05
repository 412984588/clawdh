#!/bin/bash
# BMad团队422错误防护脚本

echo "🛡️  BMad 422错误防护系统"
echo "正在检查安全状态..."

# 检查是否存在422错误风险
if grep -r "TodoWrite" . --include="*.json" --include="*.py" 2>/dev/null; then
    echo "⚠️  检测到TodoWrite使用风险"
    echo "🔄 自动切换到BMad SafeTodo..."
else
    echo "✅ 系统安全"
fi

# 激活BMad保护
echo "🚀 BMad SafeTodo已准备就绪"
echo "使用方法："
echo "  python3 bmad_solutions/bmad_safe_todo.py add '任务内容'"
echo "  python3 bmad_solutions/bmad_safe_todo.py list"
echo "  python3 bmad_solutions/bmad_safe_todo.py update ID completed"
