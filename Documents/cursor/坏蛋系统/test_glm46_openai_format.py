#!/usr/bin/env python3
"""
通过OpenAI兼容格式测试GLM-4.6
"""

import os
from dotenv import load_dotenv
from crewai import LLM

# 加载环境变量
load_dotenv()

# 设置环境变量
os.environ["OPENAI_API_KEY"] = os.getenv("ZHIPUAI_API_KEY")
os.environ["OPENAI_API_BASE"] = "https://open.bigmodel.cn/api/paas/v4"

def test_glm46():
    """测试GLM-4.6"""
    print("\n🚀 测试 GLM-4.6 (OpenAI兼容格式)")
    print("="*60)

    try:
        # 创建LLM实例
        llm = LLM(
            model="openai/glm-4.6",
            temperature=0.1
        )

        print("✅ GLM-4.6 初始化成功")

        # 简单测试
        response = llm.call("请回答：智谱AI的创始人是谁？")

        print(f"\n✅ GLM-4.6 调用成功！")
        print(f"响应: {response}")

        return True

    except Exception as e:
        print(f"\n❌ GLM-4.6 调用失败")
        print(f"错误: {e}")

        # 分析错误
        error_msg = str(e).lower()
        if "余额" in error_msg or "insufficient" in error_msg:
            print("\n💡 分析：")
            print("  - GLM-4.6 可能需要额外的付费额度")
            print("  - China Coding Plan 可能只包含部分模型")
            print("  - 建议使用 GLM-4-Flash 作为替代")

        return False

def test_glm4_flash():
    """测试GLM-4-Flash"""
    print("\n🚀 测试 GLM-4-Flash (备用)")
    print("="*60)

    try:
        llm = LLM(
            model="openai/glm-4-flash",
            temperature=0.1
        )

        response = llm.call("请回答：你是哪个模型？")

        print(f"✅ GLM-4-Flash 调用成功！")
        print(f"响应: {response}")

        return True

    except Exception as e:
        print(f"❌ GLM-4-Flash 调用失败: {e}")
        return False

def main():
    """主函数"""
    print("🔍 GLM-4.6 权限测试")
    print(f"🔑 API Key: {os.getenv('ZHIPUAI_API_KEY', 'Not Found')[:10]}...")
    print(f"🌐 Base URL: {os.getenv('OPENAI_API_BASE')}")

    # 测试GLM-4.6
    glm46_success = test_glm46()

    # 如果GLM-4.6失败，测试GLM-4-Flash
    if not glm46_success:
        print("\n" + "="*60)
        test_glm4_flash()

    print("\n" + "="*60)
    print("📝 建议:")

    if glm46_success:
        print("✅ 可以使用 GLM-4.6")
        print("   更新 enhanced_crewai_system.py 使用 model='openai/glm-4.6'")
    else:
        print("⚠️  GLM-4.6 暂时不可用")
        print("   继续使用 GLM-4-Flash (免费且快速)")
        print("   如需使用 GLM-4.6，可能需要：")
        print("   1. 升级套餐")
        print("   2. 购买额外额度")
        print("   3. 联系智谱客服")

if __name__ == "__main__":
    main()