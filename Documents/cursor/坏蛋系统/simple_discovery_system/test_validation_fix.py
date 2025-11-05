#!/usr/bin/env python3
"""
测试修复后的验证算法
"""
from perfect_5agent_system import SharedKnowledgeBase, AdaptiveValidationAgent
import json

def test_validation_fix():
    print('🔍 测试修复后的验证算法')
    print('='*60)

    # 初始化知识库
    kb = SharedKnowledgeBase()
    va = AdaptiveValidationAgent(kb)

    # 测试平台
    test_platforms = ['stripe.com', 'paypal.com', 'squareup.com']

    for platform in test_platforms:
        print(f'\n🎯 测试平台: {platform}')
        print('-' * 40)

        result = va.validate_platform(platform)

        if result:
            print(f'✅ 验证成功!')
            print(f'   状态码: {result.get("status_code")}')
            print(f'   页面标题: {result.get("page_title", "N/A")}')
            print(f'   可访问: {result.get("accessible", False)}')

            # 检查功能检测
            features = ['has_signup', 'has_login', 'has_payment_mention',
                       'has_sell_features', 'has_api_mention', 'has_pricing']
            print(f'   功能检测:')
            for feature in features:
                value = result.get(feature, False)
                print(f'     {feature}: {value}')

            # 检查业务分析
            print(f'   业务分析:')
            print(f'     业务类型: {result.get("business_type", "unknown")}')
            print(f'     置信度: {result.get("confidence_score", 0.0)}')

            # 检查验证标准
            validation_criteria = result.get('validation_criteria_met', {})
            print(f'   验证标准:')
            for criterion, passed in validation_criteria.items():
                status = "✅" if passed else "❌"
                print(f'     {criterion}: {status}')

            # 最重要的：最终分数
            final_score = result.get('final_score', 0.0)
            print(f'   🎯 最终分数: {final_score}')

            # 计算预期分数
            base_score = result.get('confidence_score', 0.0)
            feature_bonus = 0.0
            if result.get('has_signup'):
                feature_bonus += 0.20
            if result.get('has_payment_mention'):
                feature_bonus += 0.25
            if result.get('has_sell_features'):
                feature_bonus += 0.20
            if result.get('has_api_mention'):
                feature_bonus += 0.15
            if result.get('has_pricing'):
                feature_bonus += 0.10

            business_type = result.get('business_type', '')
            business_bonus = 0.0
            if business_type in ['payment_processor', 'marketplace', 'saas_platform', 'platform']:
                business_bonus += 0.25

            expected_score = min(1.0, base_score + feature_bonus + business_bonus)
            print(f'   📊 预期分数: {expected_score}')
            print(f'   📊 分数匹配: {"✅" if abs(final_score - expected_score) < 0.01 else "❌"}')

        else:
            print(f'❌ 验证失败')

    print(f'\n🎉 测试完成!')

if __name__ == '__main__':
    test_validation_fix()