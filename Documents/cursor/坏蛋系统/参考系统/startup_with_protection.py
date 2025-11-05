#!/usr/bin/env python3
"""
女王条纹测试2项目启动脚本
自动应用422错误防护措施
"""

import sys
import os
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 自动应用422错误防护
print("🛡️ 启动422错误防护...")
try:
    from auto_apply_422_fix import apply_all_422_fixes
    fixes = apply_all_422_fixes()
    for fix in fixes:
        print(f"  {fix}")
    print("✅ 422错误防护启动完成")
except Exception as e:
    print(f"⚠️ 422错误防护启动失败: {e}")

# 现在可以安全地导入和使用其他模块
print("\n🚀 项目现在可以安全使用")

# 使用示例：
# from auto_apply_422_fix import protect_from_422
#
# # 在API调用前保护请求数据
# safe_request = protect_from_422(your_request_data)
