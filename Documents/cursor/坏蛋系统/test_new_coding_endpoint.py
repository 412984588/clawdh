#!/usr/bin/env python3
"""
测试新的coding专用端点
"""

import os
from dotenv import load_dotenv
from crewai import LLM

# 加载环境变量
load_dotenv()

# 新的coding专用端点
NEW_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4"

def test_endpoint(base_url, model_name, endpoint_name):
    """测试指定的端点和模型"""
    print(f"\n🚀 测试 {endpoint_name}")
    print("="*60)
    print(f"端点: {base_url}")
    print(f"模型: {model_name}")
    print("-" * 60)

    try:
        # 设置环境变量
        os.environ["OPENAI_API_KEY"] = os.getenv("ZHIPUAI_API_KEY")
        os.environ["OPENAI_API_BASE"] = base_url

        # 创建LLM实例
        llm = LLM(
            model=model_name,
            temperature=0.1
        )

        print(f"✅ {model_name} 初始化成功")

        # 测试调用
        response = llm.call("请回答：你是哪个模型？")

        print(f"\n✅ {model_name} 调用成功！")
        print(f"响应: {response[:200]}...")

        return True

    except Exception as e:
        print(f"\n❌ {model_name} 调用失败")
        print(f"错误: {e}")
        return False

def main():
    """主函数"""
    print("🔍 测试新的coding专用端点")
    print(f"🔑 API Key: {os.getenv('ZHIPUAI_API_KEY', 'Not Found')[:10]}...")

    # 测试配置
    test_configs = [
        {
            "base_url": NEW_BASE_URL,
            "model": "openai/glm-4.6",
            "name": "Coding端点 - GLM-4.6"
        },
        {
            "base_url": NEW_BASE_URL,
            "model": "openai/glm-4-flash",
            "name": "Coding端点 - GLM-4-Flash"
        },
        {
            "base_url": "https://open.bigmodel.cn/api/paas/v4",
            "model": "openai/glm-4.6",
            "name": "原端点 - GLM-4.6"
        }
    ]

    results = []

    for config in test_configs:
        success = test_endpoint(
            config["base_url"],
            config["model"],
            config["name"]
        )
        results.append({
            "name": config["name"],
            "success": success
        })

    # 输出结果汇总
    print("\n" + "="*60)
    print("📊 测试结果汇总")
    print("="*60)

    for result in results:
        status = "✅ 可用" if result["success"] else "❌ 不可用"
        print(f"{result['name']}: {status}")

    # 推荐配置
    print("\n💡 推荐配置:")
    coding_glm46 = next((r for r in results if "Coding端点 - GLM-4.6" in r["name"] and r["success"]), None)

    if coding_glm46:
        print("✅ 使用新的coding端点 + GLM-4.6")
        print("   base_url: https://open.bigmodel.cn/api/coding/paas/v4")
        print("   model: openai/glm-4.6")
    else:
        # 找到第一个可用的配置
        available = next((r for r in results if r["success"]), None)
        if available:
            if "GLM-4-Flash" in available["name"]:
                print("⚠️  使用 GLM-4-Flash (免费版本)")
            elif "原端点" in available["name"]:
                print("⚠️  继续使用原端点")
        else:
            print("❌ 所有配置都不可用，请检查API Key")

if __name__ == "__main__":
    main()