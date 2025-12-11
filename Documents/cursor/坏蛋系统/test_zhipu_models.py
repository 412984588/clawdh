#!/usr/bin/env python3
"""
测试智谱API支持的不同模型
"""

import os
from dotenv import load_dotenv
from crewai import LLM

# 加载环境变量
load_dotenv()

# 设置OpenAI兼容环境变量
os.environ["OPENAI_API_KEY"] = os.getenv("ZHIPUAI_API_KEY")
os.environ["OPENAI_API_BASE"] = "https://open.bigmodel.cn/api/paas/v4"

# 测试不同的模型
models_to_test = [
    "openai/glm-4-flash",
    "openai/glm-4-air",
    "openai/glm-4-airx",
    "openai/glm-4",
    "openai/glm-4.6"
]

def test_model(model_name):
    """测试单个模型"""
    print(f"\n🔍 测试模型: {model_name}")
    print("-" * 50)

    try:
        # 初始化LLM
        llm = LLM(
            model=model_name,
            base_url="https://open.bigmodel.cn/api/paas/v4",
            api_key=os.getenv("ZHIPUAI_API_KEY"),
            temperature=0.1
        )

        # 尝试调用
        response = llm.call("请回答：1+1等于多少？")
        print(f"✅ {model_name} 成功")
        print(f"   响应: {response[:100]}...")
        return True

    except Exception as e:
        error_msg = str(e)
        if "余额不足" in error_msg:
            print(f"❌ {model_name} - 需要付费额度")
        elif "不支持的模型" in error_msg or "model" in error_msg.lower():
            print(f"❌ {model_name} - 模型不支持")
        else:
            print(f"❌ {model_name} - {error_msg}")
        return False

def main():
    """主函数"""
    print("🚀 智谱模型测试")
    print(f"🔑 API Key: {os.getenv('ZHIPUAI_API_KEY', 'Not Found')[:10]}...")

    available_models = []

    for model in models_to_test:
        if test_model(model):
            available_models.append(model)

    print("\n" + "="*60)
    print("📊 测试结果汇总")
    print("="*60)

    if available_models:
        print("✅ 可用模型:")
        for model in available_models:
            print(f"  - {model}")
    else:
        print("❌ 没有可用的免费模型")

    print("\n💡 建议:")
    if "openai/glm-4-flash" in available_models:
        print("- 使用 glm-4-flash 作为默认模型（免费且快速）")
    if "openai/glm-4-air" in available_models:
        print("- 使用 glm-4-air 作为备选模型（免费）")
    if "openai/glm-4.6" in available_models:
        print("- 使用 glm-4.6 作为高级模型（可能需要付费）")

if __name__ == "__main__":
    main()