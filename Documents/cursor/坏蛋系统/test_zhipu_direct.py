#!/usr/bin/env python3
"""
直接测试智谱API
"""

import os
from dotenv import load_dotenv
import requests

# 加载环境变量
load_dotenv()
api_key = os.getenv("ZHIPUAI_API_KEY")

print(f"🔑 API Key: {api_key[:10]}...{api_key[-10:]}")
print(f"📊 长度: {len(api_key)}")

# 测试智谱API
url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "glm-4.6",
    "messages": [
        {"role": "user", "content": "你好，请回复'测试成功'"}
    ],
    "temperature": 0.1
}

print("\n📡 测试智谱API...")
try:
    response = requests.post(url, json=data, headers=headers, timeout=10)

    print(f"状态码: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("✅ API调用成功!")
        print(f"响应: {result['choices'][0]['message']['content']}")
    else:
        print(f"❌ API调用失败: {response.text}")

except Exception as e:
    print(f"❌ 错误: {str(e)}")

# 测试新端点
print("\n📡 测试新端点...")
url2 = "https://open.bigmodel.cn/api/anthropic"

data2 = {
    "model": "anthropic/claude-3-5-sonnet-20241022",
    "messages": [
        {"role": "user", "content": "你好，请回复'测试成功'"}
    ],
    "temperature": 0.1
}

try:
    response2 = requests.post(url2, json=data2, headers=headers, timeout=10)

    print(f"状态码: {response2.status_code}")

    if response2.status_code == 200:
        result2 = response2.json()
        print("✅ 新端点调用成功!")
        print(f"响应: {result2['choices'][0]['message']['content']}")
    else:
        print(f"❌ 新端点调用失败: {response2.text}")

except Exception as e:
    print(f"❌ 错误: {str(e)}")