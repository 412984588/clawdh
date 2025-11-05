#!/usr/bin/env python3
"""
简单测试Web Agent初始化
"""

import sys
import os

def test_web_agent():
    """测试Web Agent是否能正常导入"""
    print("🧪 测试Web Agent初始化...")

    try:
        # 尝试导入
        from web_breakthrough_agent import WebBreakthroughAgent
        print("✅ WebBreakthroughAgent 导入成功")

        # 测试实例化
        agent = WebBreakthroughAgent()
        print("✅ WebBreakthroughAgent 实例化成功")

        print("✅ Web Agent 测试完成")
        return True

    except ImportError as e:
        print(f"❌ 导入失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 其他错误: {e}")
        return False

if __name__ == "__main__":
    success = test_web_agent()

    if success:
        print("🎉 Web Agent 已准备好使用")
    else:
        print("❌ Web Agent 有问题需要修复")
        sys.exit(1)