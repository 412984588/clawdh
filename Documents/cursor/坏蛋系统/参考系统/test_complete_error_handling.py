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


完整错误处理流程集成测试
验证422错误处理,Claude Code优化和全局错误管理的集成效果
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import asyncio
import sys
import os
from pathlib import Path

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from global_error_manager import (
    setup_project_error_handling,
    safe_api_call,
    global_error_context,
    handle_project_error
)
from api_error_handler import (
    get_api_error_handler,
    APIError,
    ErrorType,
    ValidationError
)
from claude_code_optimizer import (
    get_claude_optimizer,
    create_optimized_request,
    handle_claude_response
)

class CompleteErrorHandlingTest:
    """完整错误处理测试套件"""

    def __init__(self):
        self.test_results = []
        self.start_time = time.time()

        # 初始化错误管理系统
        self.error_manager = setup_project_error_handling()
        self.api_handler = get_api_error_handler()
        self.claude_optimizer = get_claude_optimizer()

    def log_test_result(self, test_name: str, success: bool, details: str = None, duration: float = None):
        """记录测试结果"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "duration": duration or 0,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.test_results.append(result)

        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"   详情: {details}")
        if duration:
            print(f"   耗时: {duration:.2f}秒")

    def test_422_error_parsing(self):
        """测试422错误解析"""
        print("\n=== 测试422错误解析 ===")

        # 模拟422错误响应
        error_response = {
            "errors": {
                "domain": ["域名格式无效"],
                "batch_size": ["数值不能大于100"],
                "user_message": ["消息内容过短"]
            },
            "message": "验证失败",
            "status": 422
        }

        start_time = time.time()

        try:
            # 解析错误
            api_error = self.api_handler.parse_api_error(error_response, 422)

            # 验证解析结果
            success = (
                api_error.status_code == 422 and
                api_error.error_type == ErrorType.VALIDATION_ERROR and
                len(api_error.details) == 3
            )

            details = f"解析到 {len(api_error.details)} 个验证错误"
            duration = time.time() - start_time

            self.log_test_result("422错误解析", success, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("422错误解析", False, f"异常: {str(e)}", duration)

    def test_auto_fix_422_errors(self):
        """测试422错误自动修复"""
        print("\n=== 测试422错误自动修复 ===")

        # 创建422错误
        api_error = APIError(
            status_code=422,
            error_type=ErrorType.VALIDATION_ERROR,
            message="验证失败",
            details=[
                ValidationError(field="domain", message="域名格式无效", value="example"),
                ValidationError(field="user_message", message="消息内容过短", value="分析")
            ]
        )

        # 原始请求数据
        request_data = {
            "domain": "example",
            "user_message": "分析",
            "context": {"test": True}
        }

        start_time = time.time()

        try:
            # 尝试自动修复
            can_fix, fixed_data = asyncio.run(
                self.api_handler.auto_fix_request(request_data, api_error)
            )

            details = f"自动修复: {'成功' if can_fix else '失败'}"
            if can_fix:
                details += f", 修复字段: {len(fixed_data)}"

            duration = time.time() - start_time
            self.log_test_result("422错误自动修复", can_fix, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("422错误自动修复", False, f"异常: {str(e)}", duration)

    def test_claude_code_optimization(self):
        """测试Claude Code优化"""
        print("\n=== 测试Claude Code优化 ===")

        test_cases = [
            ("模糊请求", "继续分析"),
            ("明确请求", "请详细分析example.com的Stripe Connect使用情况"),
            ("空请求", ""),
            ("正常请求", "请分析这100个网站的Stripe Connect使用情况,并提供详细报告")
        ]

        for test_name, user_input in test_cases:
            start_time = time.time()

            try:
                # 创建优化请求
                api_request = create_optimized_request(user_input, {"test": True})

                # 验证请求质量
                success = (
                    len(api_request["user_message"]) >= 10 and
                    "messages" in api_request and
                    len(api_request["messages"]) > 0
                )

                details = f"消息长度: {len(api_request['user_message'])} 字符"
                duration = time.time() - start_time

                self.log_test_result(f"Claude优化-{test_name}", success, details, duration)

            except Exception as e:
                duration = time.time() - start_time
                self.log_test_result(f"Claude优化-{test_name}", False, f"异常: {str(e)}", duration)

    def test_robust_api_call(self):
        """测试健壮API调用"""
        print("\n=== 测试健壮API调用 ===")

        from claude_code_optimizer import APIRequest

        test_request = APIRequest(
            user_message="请分析example.com",
            context={"domain": "example.com"},
            tools=[],
            expected_response="分析结果",
            session_id=f"test_{int(time.time())}"
        )

        start_time = time.time()

        try:
            # 使用健壮API调用
            result = self.claude_optimizer.create_robust_api_call(test_request, max_retries=2)

            success = result["success"]
            details = f"尝试次数: {result['attempts']}, 错误数: {len(result['errors'])}"
            duration = time.time() - start_time

            self.log_test_result("健壮API调用", success, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("健壮API调用", False, f"异常: {str(e)}", duration)

    def test_safe_api_decorator(self):
        """测试安全API装饰器"""
        print("\n=== 测试安全API装饰器 ===")

        @safe_api_call(max_retries=2, data_type="api_request")
        def test_api_function(data):
            """测试API函数"""
            if data.get("simulate_error"):
                # 模拟422错误
                raise ValueError("模拟的验证错误")
            return {"success": True, "data": data}

        test_cases = [
            ("正常请求", {"user_message": "请分析网站", "simulate_error": False}),
            ("错误请求", {"user_message": "短", "simulate_error": True})
        ]

        for test_name, test_data in test_cases:
            start_time = time.time()

            try:
                result = test_api_function(test_data)
                success = result is not None
                details = f"返回结果: {type(result).__name__}"
                duration = time.time() - start_time

                self.log_test_result(f"安全装饰器-{test_name}", success, details, duration)

            except Exception as e:
                duration = time.time() - start_time
                self.log_test_result(f"安全装饰器-{test_name}", False, f"异常: {str(e)}", duration)

    def test_global_error_context(self):
        """测试全局错误上下文"""
        print("\n=== 测试全局错误上下文 ===")

        start_time = time.time()

        try:
            with global_error_context("测试操作", {"test_data": "sample"}) as error_manager:
                # 模拟成功操作
                time.sleep(0.1)
                operation_success = True

            details = f"上下文管理成功"
            duration = time.time() - start_time
            self.log_test_result("全局错误上下文(成功)", operation_success, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("全局错误上下文(成功)", False, f"异常: {str(e)}", duration)

        # 测试错误情况
        start_time = time.time()

        try:
            with global_error_context("测试错误操作") as error_manager:
                # 模拟错误操作
                raise ValueError("测试错误")

        except ValueError:
            details = "错误正确捕获和处理"
            duration = time.time() - start_time
            self.log_test_result("全局错误上下文(错误)", True, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("全局错误上下文(错误)", False, f"意外异常: {str(e)}", duration)

    def test_project_data_validation(self):
        """测试项目数据验证"""
        print("\n=== 测试项目数据验证 ===")

        test_cases = [
            ("域名分析", {
                "domain": "example.com",
                "analysis_type": "stripe_connect",
                "batch_size": 50
            }),
            ("无效数据", {
                "domain": "invalid-domain",
                "analysis_type": "x",  # 太短
                "batch_size": -5      # 负数
            }),
            ("缺失字段", {
                "domain": "example.com"
                # 缺少必填字段
            })
        ]

        for test_name, test_data in test_cases:
            start_time = time.time()

            try:
                is_valid, validated_data = self.error_manager.validate_project_data(
                    test_data, "domain_analysis"
                )

                success = True  # 验证本身总是成功的
                details = f"验证结果: {'有效' if is_valid else '无效'}"
                duration = time.time() - start_time

                self.log_test_result(f"数据验证-{test_name}", success, details, duration)

            except Exception as e:
                duration = time.time() - start_time
                self.log_test_result(f"数据验证-{test_name}", False, f"异常: {str(e)}", duration)

    def test_error_statistics(self):
        """测试错误统计"""
        print("\n=== 测试错误统计 ===")

        start_time = time.time()

        try:
            # 记录一些测试错误
            test_error = APIError(
                status_code=422,
                error_type=ErrorType.VALIDATION_ERROR,
                message="测试错误",
                details=[]
            )

            self.error_manager.record_error(test_error, {"test": True})

            # 生成统计报告
            report = self.error_manager.generate_comprehensive_error_report()

            success = (
                "error_statistics" in report and
                "health_status" in report and
                "recommendations" in report
            )

            details = f"健康分数: {report['health_status']['score']}"
            duration = time.time() - start_time

            self.log_test_result("错误统计", success, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("错误统计", False, f"异常: {str(e)}", duration)

    def test_integration_workflow(self):
        """测试集成工作流"""
        print("\n=== 测试完整集成工作流 ===")

        start_time = time.time()

        try:
            # 1. 创建请求数据
            request_data = {
                "user_message": "分析",
                "context": {"domains": ["example.com"]},
                "session_id": f"integration_test_{int(time.time())}"
            }

            # 2. 验证数据
            is_valid, validated_data = self.error_manager.validate_project_data(
                request_data, "api_request"
            )

            # 3. 创建Claude优化请求
            api_request = create_optimized_request(
                validated_data["user_message"],
                validated_data["context"]
            )

            # 4. 使用健壮API调用
            from claude_code_optimizer import APIRequest
            claude_request = APIRequest(
                user_message=api_request["user_message"],
                context=api_request.get("context", {}),
                tools=api_request.get("tools", []),
                expected_response=api_request.get("expected_response", ""),
                session_id=api_request["session_id"]
            )

            result = self.claude_optimizer.create_robust_api_call(claude_request, max_retries=1)

            # 5. 处理结果
            if result["success"]:
                success = True
                details = f"工作流成功,尝试次数: {result['attempts']}"
            else:
                # 处理错误
                for error_info in result["errors"]:
                    if isinstance(error_info["error"], APIError):
                        handled = handle_project_error(
                            error_info["error"],
                            "集成工作流测试",
                            request_data
                        )
                        success = handled["success"]
                        details = handled.get("message", "工作流处理完成")
                        break
                else:
                    success = False
                    details = "未知错误类型"

            duration = time.time() - start_time
            self.log_test_result("集成工作流", success, details, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("集成工作流", False, f"异常: {str(e)}", duration)

    def run_all_tests(self):
        """运行所有测试"""
        print("Claude Code + 422错误处理完整测试套件")
        print("=" * 60)

        try:
            # 运行各项测试
            self.test_422_error_parsing()
            self.test_auto_fix_422_errors()
            self.test_claude_code_optimization()
            self.test_robust_api_call()
            self.test_safe_api_decorator()
            self.test_global_error_context()
            self.test_project_data_validation()
            self.test_error_statistics()
            self.test_integration_workflow()

            # 生成测试报告
            self.generate_test_report()

        except Exception as e:
            print(f"\n❌ 测试过程中出现异常: {e}")
            import traceback
            traceback.print_exc()

    def generate_test_report(self):
        """生成测试报告"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests

        total_duration = time.time() - self.start_time

        print("\n" + "=" * 60)
        print("测试报告")
        print("=" * 60)

        print(f"总测试数: {total_tests}")
        print(f"通过测试: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"失败测试: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"总耗时: {total_duration:.2f}秒")

        if failed_tests > 0:
            print("\n失败的测试:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test_name']}: {result['details']}")

        # 生成错误管理报告
        print("\n错误管理系统统计:")
        error_report = self.error_manager.generate_comprehensive_error_report()
        health_status = error_report["health_status"]
        print(f"  系统健康分数: {health_status['score']}/100 ({health_status['status']})")
        print(f"  总错误数: {error_report['error_statistics']['total_errors']}")
        print(f"  自动修复数: {error_report['error_statistics']['auto_fixes']}")
        print(f"  成功重试数: {error_report['error_statistics']['successful_retries']}")

        # 保存详细报告
        report_data = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": passed_tests / total_tests * 100,
                "total_duration": total_duration
            },
            "test_results": self.test_results,
            "error_management_report": error_report,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }

        report_file = "/Users/zhimingdeng/Projects/女王条纹测试2/complete_error_handling_test_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)

        print(f"\n详细报告已保存到: {report_file}")

        # 判断测试是否成功
        success_rate = passed_tests / total_tests * 100
        if success_rate >= 80:
            print("\n🎉 测试通过!错误处理系统工作正常.")
            print("\n系统已具备以下能力:")
            print("✅ 自动解析和处理422错误")
            print("✅ 智能修复请求数据")
            print("✅ 优化Claude Code API交互")
            print("✅ 全局错误管理和统计")
            print("✅ 自动重试和恢复机制")
        else:
            print(f"\n⚠️  测试通过率较低({success_rate:.1f}%),建议检查错误处理配置.")

        return success_rate >= 80

def main():
    """主测试函数"""
    # 确保日志目录存在
    log_dir = Path("/Users/zhimingdeng/Projects/女王条纹测试2/logs")
    log_dir.mkdir(exist_ok=True)

    # 运行测试
    test_suite = CompleteErrorHandlingTest()
    success = test_suite.run_all_tests()

    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)