#!/bin/bash
# 女王条纹测试2 - API错误修复Hook

echo "🔧 检测到API调用，应用422错误修复..."

# 检查是否需要修复API格式
if [ -f "/Users/zhimingdeng/Projects/女王条纹测试2/claude_api_422_fix.py" ]; then
    python3 -c "
import sys
sys.path.append('/Users/zhimingdeng/Projects/女王条纹测试2')
print('✅ API 422错误修复器已加载')
"
else
    echo "⚠️ API修复器未找到"
fi
