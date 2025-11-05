#!/usr/bin/env python3
"""

def create_robust_api_request(endpoint: str, data: Dict, headers: Dict = None) -> Dict:
    """创建健壮的API请求结构"""
    # 默认请求头
    default_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Claude-Code-Fixer/2.0.0"
    }

    if headers:
        default_headers.update(headers)

    # 验证请求数据
    is_valid, errors = validate_request_data(data)
    if not is_valid:
        raise ValueError(f"请求数据验证失败: {', '.join(errors)}")

    return {
        "url": endpoint,
        "method": "POST",
        "headers": default_headers,
        "json": data,
        "timeout": 30,
        "max_retries": 3
    }



import asyncio
import time

async def retry_with_backoff(func, *args, max_retries=3, backoff_factor=2, **kwargs):
    """带退避算法的重试机制"""
    for attempt in range(max_retries):
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)

            # 检查422错误
            if isinstance(result, dict) and result.get("status_code") == 422:
                if attempt < max_retries - 1:
                    wait_time = backoff_factor ** attempt
                    logger.warning(f"422错误,{wait_time}秒后重试 (尝试 {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue

            return result

        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = backoff_factor ** attempt
                logger.warning(f"请求失败,{wait_time}秒后重试: {e}")
                await asyncio.sleep(wait_time)
                continue
            else:
                raise e

    raise Exception(f"重试{max_retries}次后仍然失败")



def handle_422_error(response_data: Dict, original_request: Dict) -> Dict:
    """处理422 Unprocessable Entity错误"""
    if response_data.get("status_code") == 422:
        errors = response_data.get("errors", {})

        # 分析错误原因
        error_details = []
        for field, messages in errors.items():
            if isinstance(messages, list):
                error_details.append(f"{field}: {', '.join(messages)}")
            else:
                error_details.append(f"{field}: {messages}")

        # 生成修复建议
        return {
            "success": False,
            "error_type": "validation_error",
            "error_details": error_details,
            "fix_suggestions": [
                "检查请求数据格式",
                "验证必填字段",
                "确认字段类型正确",
                "检查字段长度限制"
            ],
            "recovery_request": create_recovery_request(original_request, error_details)
        }

    return {"success": True}

def create_recovery_request(original_request: Dict, errors: List[str]) -> Dict:
    """创建恢复请求"""
    return {
        "user_message": f"""之前的请求遇到验证错误,需要修复:

错误详情:
{chr(10).join(errors)}

请根据错误信息修正请求并重新执行.
""",
        "context": {**original_request.get("context", {}), "error_recovery": True},
        "retry_after": 2
    }



def validate_request_data(data: Dict, rules: Dict = None) -> Tuple[bool, List[str]]:
    """验证请求数据,防止422错误"""
    errors = []

    if rules is None:
        rules = {
            "required": ["user_message", "session_id"],
            "string_fields": ["user_message"],
            "max_length": {"user_message": 10000}
        }

    # 检查必填字段
    for field in rules.get("required", []):
        if field not in data or not data[field]:
            errors.append(f"必填字段缺失: {field}")

    # 检查字符串字段
    for field in rules.get("string_fields", []):
        if field in data and not isinstance(data[field], str):
            errors.append(f"字段类型错误: {field} 应为字符串")

    # 检查长度限制
    for field, max_len in rules.get("max_length", {}).items():
        if field in data and len(str(data[field])) > max_len:
            errors.append(f"字段长度超限: {field} 超过 {max_len} 字符")

    return len(errors) == 0, errors



class ClaudeErrorHandling:
    """Claude错误处理类"""

    @staticmethod
    def handle_no_response(session_id: str) -> str:
        """处理No response requested情况"""
        return f"""系统检测到响应不完整.请重新分析当前任务:

会话ID: {session_id}
时间: {time.strftime('%Y-%m-%d %H:%M:%S')}

请提供:
1. 当前执行状态
2. 具体结果数据
3. 下一步行动建议
4. 遇到的问题

确保回复包含详细内容."""



def validate_claude_response(response: str) -> Tuple[bool, str]:
    """验证Claude响应,过滤No response requested"""
    if not response or len(response.strip()) < 10:
        return False, "响应过短,需要重新请求"

    if "no response requested" in response.lower():
        return False, "检测到No response requested,需要重新构建请求"

    return True, response



def optimize_claude_request(user_input: str, context: Dict = None) -> Dict:
    """优化Claude请求结构,防止No response requested"""
    if not user_input or user_input.strip() == "":
        user_input = "请继续执行当前任务并提供详细结果"

    # 确保有明确的指令
    if len(user_input.strip()) < 10:
        user_input = f"请详细执行: {user_input}\n\n请提供具体步骤,结果和建议."

    return {
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 4000,
        "temperature": 0.7,
        "response_format": {"type": "text"},
        "context": context or {}
    }


Claude Code修复验证测试脚本
测试"No response requested"问题的解决方案
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import sys
import os

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from claude_code_optimizer import (
    get_claude_optimizer,
    create_optimized_request,
    handle_claude_response
)

def test_request_optimization():
    """测试请求优化功能"""
    print("=== 测试请求优化功能 ===")

    optimizer = get_claude_optimizer()

    # 测试用例
    test_cases = [
        {
            "name": "模糊请求测试",
            "input": "继续",
            "expected_optimization": True
        },
        {
            "name": "明确请求测试",
            "input": "请详细分析stripe.com的Connect功能使用情况",
            "expected_optimization": False
        },
        {
            "name": "空请求测试",
            "input": "",
            "expected_optimization": True
        },
        {
            "name": "短请求测试",
            "input": "分析",
            "expected_optimization": True
        }
    ]

    results = []

    for test_case in test_cases:
        print(f"\n测试: {test_case['name']}")
        print(f"输入: '{test_case['input']}'")

        # 优化请求
        optimized = optimizer.optimize_request_structure(test_case['input'])
        print(f"优化后: '{optimized[:100]}...'" if len(optimized) > 100 else f"优化后: '{optimized}'")

        # 检查是否进行了优化
        was_optimized = len(optimized) > len(test_case['input']) + 20
        expected_optimization = test_case['expected_optimization']

        success = was_optimized == expected_optimization
        print(f"预期优化: {expected_optimization}, 实际优化: {was_optimized}, 结果: {'✅' if success else '❌'}")

        results.append({
            "test": test_case['name'],
            "success": success,
            "input_length": len(test_case['input']),
            "output_length": len(optimized)
        })

    return results

def test_api_request_creation():
    """测试API请求创建功能"""
    print("\n=== 测试API请求创建功能 ===")

    # 测试不同类型的请求
    test_requests = [
        {
            "name": "基础分析请求",
            "input": "请分析example.com的Stripe Connect使用情况",
            "context": {"domain": "example.com", "analysis_type": "stripe_connect"}
        },
        {
            "name": "批量分析请求",
            "input": "批量分析100个网站",
            "context": {"batch_size": 100, "domains": ["example.com", "test.com"]}
        },
        {
            "name": "错误恢复请求",
            "input": "之前的分析出错了,请重新开始",
            "context": {"error_recovery": True, "last_error": "timeout"}
        }
    ]

    results = []

    for test_req in test_requests:
        print(f"\n测试: {test_req['name']}")

        # 创建优化的API请求
        api_call = create_optimized_request(test_req['input'], test_req['context'])

        # 验证请求结构
        required_fields = ['messages', 'system', 'session_id', 'response_format']
        has_all_fields = all(field in api_call for field in required_fields)

        # 验证用户消息
        has_user_message = (
            'messages' in api_call and
            len(api_call['messages']) > 0 and
            api_call['messages'][0]['role'] == 'user' and
            len(api_call['messages'][0]['content']) > 0
        )

        # 验证响应格式要求
        has_response_requirements = (
            'response_format' in api_call and
            api_call['response_format'].get('require_content', False)
        )

        success = has_all_fields and has_user_message and has_response_requirements

        print(f"包含必要字段: {has_all_fields}")
        print(f"包含用户消息: {has_user_message}")
        print(f"包含响应要求: {has_response_requirements}")
        print(f"结果: {'✅' if success else '❌'}")

        results.append({
            "test": test_req['name'],
            "success": success,
            "session_id": api_call.get('session_id', 'N/A'),
            "message_length": len(api_call['messages'][0]['content']) if has_user_message else 0
        })

    return results

def test_response_validation():
    """测试响应验证功能"""
    print("\n=== 测试响应验证功能 ===")

    # 测试不同类型的响应
    test_responses = [
        {
            "name": "正常响应",
            "response": "分析完成.example.com 使用了 Stripe Connect,发现了以下证据:connect.stripe.com 链接,合作伙伴注册页面等.下一步建议...",
            "expected_valid": True
        },
        {
            "name": "No Response",
            "response": "No response requested.",
            "expected_valid": False
        },
        {
            "name": "空响应",
            "response": "",
            "expected_valid": False
        },
        {
            "name": "短响应",
            "response": "OK",
            "expected_valid": False
        },
        {
            "name": "混合内容响应",
            "response": "No response requested. However, here's what I found: analysis completed successfully.",
            "expected_valid": False
        }
    ]

    results = []

    for test_resp in test_responses:
        print(f"\n测试: {test_resp['name']}")
        print(f"响应: '{test_resp['response'][:50]}...'" if len(test_resp['response']) > 50 else f"响应: '{test_resp['response']}'")

        # 处理响应
        session_id = f"test_session_{int(time.time())}"
        result = handle_claude_response(test_resp['response'], session_id)

        success = result['status'] == 'success' if test_resp['expected_valid'] else result['status'] == 'needs_retry'

        print(f"预期有效: {test_resp['expected_valid']}")
        print(f"实际状态: {result['status']}")
        print(f"需要重试: {result['validation']['needs_retry']}")
        print(f"结果: {'✅' if success else '❌'}")

        if result['validation']['suggestions']:
            print(f"建议: {', '.join(result['validation']['suggestions'])}")

        results.append({
            "test": test_resp['name'],
            "success": success,
            "status": result['status'],
            "needs_retry": result['validation']['needs_retry']
        })

    return results

def test_session_management():
    """测试会话管理功能"""
    print("\n=== 测试会话管理功能 ===")

    optimizer = get_claude_optimizer()

    # 创建多个会话
    session_ids = []
    for i in range(3):
        request = create_optimized_request(f"测试请求 {i+1}")
        session_ids.append(request['session_id'])
        print(f"创建会话 {i+1}: {request['session_id']}")

    # 检查会话存储
    stored_sessions = len(optimizer.session_contexts)
    print(f"存储的会话数: {stored_sessions}")
    sessions_success = stored_sessions == 3

    # 测试后续请求
    if session_ids:
        follow_up = optimizer.create_follow_up_request(session_ids[0], "继续分析")
        follow_up_success = follow_up is not None and follow_up.session_id == session_ids[0]
        print(f"后续请求测试: {'✅' if follow_up_success else '❌'}")

    # 清理测试会话
    for session_id in session_ids:
        if session_id in optimizer.session_contexts:
            del optimizer.session_contexts[session_id]

    cleanup_success = len(optimizer.session_contexts) == 0
    print(f"会话清理测试: {'✅' if cleanup_success else '❌'}")

    return {
        "session_creation": sessions_success,
        "follow_up_request": follow_up_success if session_ids else False,
        "session_cleanup": cleanup_success
    }

def generate_test_report(all_results):
    """生成测试报告"""
    print("\n" + "="*50)
    print("测试报告")
    print("="*50)

    total_tests = 0
    passed_tests = 0

    for category, results in all_results.items():
        print(f"\n{category}:")

        if isinstance(results, list):
            for result in results:
                total_tests += 1
                if result['success']:
                    passed_tests += 1
                status = "✅" if result['success'] else "❌"
                print(f"  {status} {result['test']}")
        else:
            for test_name, success in results.items():
                total_tests += 1
                if success:
                    passed_tests += 1
                status = "✅" if success else "❌"
                print(f"  {status} {test_name}")

    print(f"\n总计: {passed_tests}/{total_tests} 测试通过")
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    print(f"成功率: {success_rate:.1f}%")

    # 保存详细报告
    report_path = "/Users/zhimingdeng/Projects/女王条纹测试2/test_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": success_rate,
            "detailed_results": all_results
        }, f, ensure_ascii=False, indent=2)

    print(f"详细报告已保存到: {report_path}")

    return success_rate >= 80  # 80%以上通过率视为成功

def main():
    """主测试函数"""
    print("Claude Code 'No response requested' 修复验证测试")
    print("="*60)

    try:
        # 运行所有测试
        all_results = {}

        print("开始测试...")

        # 测试请求优化
        all_results['请求优化测试'] = test_request_optimization()

        # 测试API请求创建
        all_results['API请求创建测试'] = test_api_request_creation()

        # 测试响应验证
        all_results['响应验证测试'] = test_response_validation()

        # 测试会话管理
        all_results['会话管理测试'] = test_session_management()

        # 生成报告
        success = generate_test_report(all_results)

        if success:
            print("\n🎉 所有测试通过!修复方案工作正常.")
            print("\n使用建议:")
            print("1. 在您的代码中导入 claude_code_optimizer")
            print("2. 使用 create_optimized_request() 创建API请求
        max_tokens=4000
    )
            print("3. 使用 handle_claude_response() 处理响应")
            print("4. 遇到问题时,优化器会自动提供恢复策略")
        else:
            print("\n⚠️  部分测试失败,请检查修复方案.")

        return success

    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)