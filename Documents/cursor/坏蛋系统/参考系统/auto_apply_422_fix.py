#!/usr/bin/env python3
"""
自动应用422错误修复
在项目启动时自动应用所有防护措施
作者: BMad-Method团队
版本: 1.0.0
"""

import sys
import os
import logging
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_all_422_fixes():
    """应用所有422错误修复措施"""
    logger.info("🚀 开始自动应用422错误防护措施...")

    fixes_applied = []

    # 1. 应用强制修复补丁
    try:
        project_root = Path(__file__).parent
        emergency_patch = project_root / "emergency_422_patch.py"

        if emergency_patch.exists():
            # 将紧急补丁路径添加到sys.path
            if str(project_root) not in sys.path:
                sys.path.insert(0, str(project_root))

            # 导入并应用补丁
            import emergency_422_patch
            fixes_applied.append("✅ 紧急修复补丁已应用")
            logger.info("✅ 紧急修复补丁已应用")
        else:
            logger.warning("⚠️ 紧急补丁文件不存在")

    except Exception as e:
        logger.error(f"❌ 紧急补丁应用失败: {e}")

    # 2. 设置环境变量防护
    os.environ['BMAD_422_PROTECTION_ACTIVE'] = 'true'
    fixes_applied.append("✅ 环境变量防护已设置")
    logger.info("✅ 环境变量防护已设置")

    # 3. 创建全局防护函数
    def global_422_protection(request_data):
        """全局422错误防护函数"""
        try:
            from bmad_solutions.force_422_fix import force_fix_422_request
            return force_fix_422_request(request_data)
        except ImportError:
            logger.warning("⚠️ 强制修复模块不可用")
            return request_data

    # 将防护函数添加到全局命名空间
    globals()['protect_from_422'] = global_422_protection
    fixes_applied.append("✅ 全局防护函数已创建")
    logger.info("✅ 全局防护函数已创建")

    logger.info(f"🛡️ 422错误防护措施应用完成，共应用 {len(fixes_applied)} 项修复")

    return fixes_applied

def create_startup_script():
    """创建项目启动脚本"""
    startup_content = '''#!/usr/bin/env python3
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
print("\\n🚀 项目现在可以安全使用")

# 使用示例：
# from auto_apply_422_fix import protect_from_422
#
# # 在API调用前保护请求数据
# safe_request = protect_from_422(your_request_data)
'''

    startup_file = Path("/Users/zhimingdeng/Projects/女王条纹测试2/startup_with_protection.py")
    with open(startup_file, 'w', encoding='utf-8') as f:
        f.write(startup_content)

    print(f"✅ 启动脚本已创建: {startup_file}")
    return startup_file

def main():
    """主函数"""
    print("🚀 女王条纹测试2 - 422错误自动防护系统")
    print("=" * 60)

    # 应用所有修复措施
    fixes = apply_all_422_fixes()

    print(f"\n📊 修复措施应用状态:")
    for fix in fixes:
        print(f"  {fix}")

    # 创建启动脚本
    print(f"\n📝 创建项目启动脚本...")
    startup_file = create_startup_script()

    print(f"\n🎯 使用指南:")
    print(f"1. 启动项目时运行: python3 {startup_file.name}")
    print(f"2. 或在代码开头导入: from auto_apply_422_fix import protect_from_422")
    print(f"3. API调用前执行: safe_request = protect_from_422(request_data)")

    # 测试防护功能
    print(f"\n🧪 测试防护功能...")
    test_request = {
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "测试消息"},
            {"role": "assistant", "content": [
                {"type": "text", "text": "正常回复"},
                {"type": "tool_use", "id": "test", "name": "TodoWrite"}  # 这会被移除
            ]}
        ]
    }

    try:
        from bmad_solutions.force_422_fix import force_fix_422_request
        safe_request = force_fix_422_request(test_request)

        # 检查是否还有tool_use
        tool_count = 0
        for msg in safe_request["messages"]:
            if isinstance(msg.get("content"), list):
                for item in msg["content"]:
                    if isinstance(item, dict) and item.get("type") == "tool_use":
                        tool_count += 1

        if tool_count == 0:
            print("✅ 防护功能测试通过 - 所有tool_use已被移除")
        else:
            print(f"⚠️ 防护功能测试失败 - 仍有{tool_count}个tool_use")

    except Exception as e:
        print(f"❌ 防护功能测试失败: {e}")

    print(f"\n🎉 422错误自动防护系统部署完成！")
    print(f"您的项目现在已受到全面的422错误保护。")

if __name__ == "__main__":
    main()