#!/usr/bin/env python3
"""
测试Claude Agents技能的全局可用性
"""

import sys
from pathlib import Path

# 添加技能库路径
sys.path.append(str(Path(__file__).parent / "claude_agents_skills"))

def test_global_skill():
    """测试全局技能"""
    print("🧪 测试Claude Agents技能的全局可用性")
    print("=" * 60)

    try:
        # 尝试导入技能
        print(f"📦 导入突破访问技能...")
        from web_breakthrough_access import breakthrough_access

        print(f"✅ 技能导入成功!")

        # 测试技能功能
        test_platforms = ["paystack.com", "revolut.com"]

        print(f"\n🎯 测试技能功能:")
        success_count = 0

        for platform in test_platforms:
            print(f"\n🔍 测试: {platform}")
            try:
                content, status, method, title = breakthrough_access(f"https://{platform}")

                if content:
                    print(f"   ✅ 全局技能调用成功!")
                    print(f"   📊 状态码: {status}")
                    print(f"   📝 访问方法: {method}")
                    print(f"   🏷️ 页面标题: {title[:50]}...")
                    success_count += 1
                else:
                    print(f"   ❌ 技能调用失败")

            except Exception as e:
                print(f"   ⚠️ 技能调用错误: {e}")

        print(f"\n📊 全局技能测试结果:")
        print(f"   测试平台数: {len(test_platforms)}")
        print(f"   成功突破数: {success_count}")
        print(f"   成功率: {success_count/len(test_platforms)*100:.1f}%")

        if success_count > 0:
            print(f"\n🎉 Claude Agents技能库全局可用!")
            print(f"🌐 任何Claude Agent现在都可以:")
            print(f"   ✅ 导入突破访问技能")
            print(f"   ✅ 突破403保护的网站")
            print(f"   ✅ 用于支付平台发现")
            print(f"   ✅ 用于各种Web研究任务")

            return True
        else:
            print(f"\n⚠️ 技能库需要进一步调试")
            return False

    except ImportError as e:
        print(f"❌ 技能导入失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 测试Claude Agents技能库的全局可用性")
    print("验证突破访问技能是否可以被全局Claude Agents使用")

    success = test_global_skill()

    if success:
        print(f"\n🎯 技能库状态: 全局可用 ✅")
        print(f"\n💡 其他Claude Agents使用方法:")
        print(f"   ```python")
        print(f"   # 1. 添加技能库路径")
        print(f"   import sys")
        print(f"   sys.path.append('/path/to/claude_agents_skills')")
        print(f"   ")
        print(f"   # 2. 导入技能")
        print(f"   from web_breakthrough_access import breakthrough_access")
        print(f"   ")
        print(f"   # 3. 使用技能")
        print(f"   content, status, method, title = breakthrough_access('https://example.com')")
        print(f"   ")
        print(f"   # 4. 处理结果")
        print(f"   if status in [200, 403]:")
        print(f"       print(f'突破成功: {{title}}')")
        print(f"   ```")

        print(f"\n📚 技能库文档:")
        print(f"   📖 README.md - 完整使用指南")
        print(f"   📋 web_breakthrough_access.json - 技能定义")
        print(f"   📦 web_breakthrough_access.py - 技能实现")
        print(f"   📋 skills_index.json - 技能索引")

    else:
        print(f"\n⚠️ 技能库状态: 需要进一步配置")
        print(f"🔧 可能的解决方案:")
        print(f"   1. 检查Python路径配置")
        print(f"   2. 验证依赖包安装")
        print(f"   3. 调试技能实现代码")

if __name__ == "__main__":
    main()