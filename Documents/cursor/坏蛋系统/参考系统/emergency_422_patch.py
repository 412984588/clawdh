
"""
紧急422错误防护补丁
在API调用前自动应用
"""

import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 导入强制修复函数
from bmad_solutions.force_422_fix import force_fix_422_request

# 自动补丁函数
def auto_patch_request(request_data):
    """自动应用422错误防护补丁"""
    return force_fix_422_request(request_data)

# 立即应用补丁
if hasattr(sys.modules.get('anthropic', None), 'Anthropic'):
    try:
        import anthropic

        # 保存原始messages.create方法
        original_create = anthropic.Anthropic.messages.create

        def patched_create(*args, **kwargs):
            # 自动修复请求数据
            if kwargs:
                kwargs = auto_patch_request(kwargs)

            # 调用原始方法
            return original_create(*args, **kwargs)

        # 应用补丁
        anthropic.Anthropic.messages.create = patched_create
        print("✅ 紧急422错误防护补丁已应用")

    except Exception as e:
        print(f"⚠️ 补丁应用失败: {e}")

print("🛡️ 紧急422错误防护补丁已加载")
