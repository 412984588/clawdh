#!/usr/bin/env python3
"""
测试API端点配置
"""

import os
from dotenv import load_dotenv
from crewai import LLM

# 加载环境变量
load_dotenv()

# 绕过 CrewAI 的 OpenAI Key 检查
os.environ["OPENAI_API_KEY"] = "NA"

print("🔍 测试智谱API端点配置...")
print(f"API Key: {os.getenv('ZHIPUAI_API_KEY', 'NOT SET')[:10]}...")

# 测试不同的端点配置
endpoints = [
    ("原配置", "https://open.bigmodel.cn/api/paas/v4/", "openai/glm-4.6"),
    ("新配置1", "https://open.bigmodel.cn/api/anthropic", "anthropic/claude-3-5-sonnet-20241022"),
    ("新配置2", "https://open.bigmodel.cn/api/anthropic", "openai/glm-4.6"),
]

for name, base_url, model in endpoints:
    print(f"\n📡 测试 {name}:")
    print(f"   URL: {base_url}")
    print(f"   Model: {model}")

    try:
        llm = LLM(
            model=model,
            temperature=0.1,
            api_key=os.getenv("ZHIPUAI_API_KEY"),
            base_url=base_url
        )

        # 简单测试
        response = llm.call("你好，请回复'测试成功'")
        print(f"   ✅ 成功: {response}")

    except Exception as e:
        print(f"   ❌ 失败: {str(e)}")

print("\n✨ 测试完成")