#!/usr/bin/env python3
"""
检查China Coding Plan套餐的模型权限
"""

import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

API_KEY = os.getenv("ZHIPUAI_API_KEY")
BASE_URL = "https://open.bigmodel.cn/api/paas/v4"

def check_available_models():
    """检查可用的模型列表"""
    print("\n🔍 检查China Coding Plan套餐可用模型")
    print("="*60)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # 尝试调用模型列表API
    try:
        response = requests.get(
            f"{BASE_URL}/models",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            models = response.json()
            print("✅ 成功获取模型列表：")

            # 格式化输出
            glm_models = [m for m in models.get('data', []) if 'glm' in m.get('id', '').lower()]

            print("\n📋 可用的GLM模型：")
            for model in glm_models:
                model_id = model.get('id', '')
                print(f"  - {model_id}")

            # 特别关注GLM-4.6
            glm_46 = [m for m in glm_models if 'glm-4.6' in m.get('id', '')]
            if glm_46:
                print(f"\n✅ GLM-4.6 可用！")
                for model in glm_46:
                    print(f"  模型ID: {model.get('id')}")
                    print(f"  对象类型: {model.get('object')}")
                    print(f"  创建时间: {model.get('created')}")
                    print(f"  拥有者: {model.get('owned_by')}")
            else:
                print(f"\n❌ GLM-4.6 不可用")

        else:
            print(f"❌ 获取模型列表失败: {response.status_code}")
            print(f"响应: {response.text}")

    except Exception as e:
        print(f"❌ 错误: {e}")

def test_glm46_directly():
    """直接测试GLM-4.6模型"""
    print("\n🧪 直接测试GLM-4.6模型")
    print("="*60)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "glm-4.6",
        "messages": [
            {
                "role": "user",
                "content": "请用中文回答：你是哪个模型？"
            }
        ],
        "temperature": 0.1,
        "max_tokens": 100
    }

    try:
        response = requests.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )

        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"\n✅ GLM-4.6 调用成功！")
            print(f"响应: {content}")

            # 显示使用的模型
            usage = result.get('usage', {})
            if usage:
                print(f"\n📊 使用情况:")
                print(f"  - 输入令牌: {usage.get('prompt_tokens', 0)}")
                print(f"  - 输出令牌: {usage.get('completion_tokens', 0)}")
                print(f"  - 总令牌: {usage.get('total_tokens', 0)}")
        else:
            error_info = response.json()
            error_code = error_info.get('error', {}).get('code', 'Unknown')
            error_msg = error_info.get('error', {}).get('message', 'Unknown')
            print(f"\n❌ GLM-4.6 调用失败")
            print(f"错误代码: {error_code}")
            print(f"错误信息: {error_msg}")

            # 分析错误
            if "余额不足" in error_msg:
                print("\n💡 提示: 可能是套餐类型问题")
                print("   China Coding Plan 可能不包含 GLM-4.6")
                print("   建议检查套餐详情或使用 GLM-4-Flash")

    except Exception as e:
        print(f"\n❌ 测试错误: {e}")

def main():
    """主函数"""
    print("🚀 China Coding Plan 模型权限检查")
    print(f"🔑 API Key: {API_KEY[:10]}...")

    # 检查可用模型
    check_available_models()

    # 直接测试GLM-4.6
    test_glm46_directly()

    print("\n" + "="*60)
    print("📝 总结:")
    print("1. 如果GLM-4.6不可用，建议使用GLM-4-Flash")
    print("2. GLM-4-Flash是免费且快速的选择")
    print("3. 可以联系智谱客服确认China Coding Plan包含的模型")
    print("="*60)

if __name__ == "__main__":
    main()