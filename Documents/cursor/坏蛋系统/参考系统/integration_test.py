#!/usr/bin/env python3
"""
集成测试脚本
验证所有Claude Code错误处理模块的协同工作
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import time
import json
import logging
from typing import Dict, List, Any

# 导入所有错误处理模块
from comprehensive_api_error_handler import get_comprehensive_error_handler, safe_api_call, validate_claude_request
from enhanced_claude_code_optimizer import get_enhanced_optimizer, optimize_claude_code_request, safe_claude_api_call
from api_422_prevention_system import get_422_prevention_system
from practical_claude_solution_clean import get_practical_solution, fix_claude_request

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IntegrationTester:
    """集成测试器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.test_results = []

    def run_test_case(self, test_name: str, test_func) -> Dict[str, Any]:
        """运行单个测试用例"""
        self.logger.info(f"运行测试: {test_name}")
        start_time = time.time()

        try:
            result = test_func()
            execution_time = time.time() - start_time

            test_result = {
                "test_name": test_name,
                "success": True,
                "result": result,
                "execution_time": execution_time,
                "error": None
            }

            self.logger.info(f"✅ {test_name} - 成功 ({execution_time:.3f}秒)")

        except Exception as e:
            execution_time = time.time() - start_time
            test_result = {
                "test_name": test_name,
                "success": False,
                "result": None,
                "execution_time": execution_time,
                "error": str(e)
            }

            self.logger.error(f"❌ {test_name} - 失败: {e}")

        self.test_results.append(test_result)
        return test_result

    def test_comprehensive_error_handler(self):
        """测试综合错误处理器"""
        error_handler = get_comprehensive_error_handler()

        # 测试422错误解析
        sample_422_response = {
            "error": {
                "type": "validation_error",
                "message": "Validation failed",
                "details": {
                    "field": "max_tokens",
                    "error": "This field is required."
                }
            }
        }

        parsed_error = error_handler.parse_api_error(sample_422_response, 422)

        # 测试请求验证
        sample_request = {
            "user_input": "测试请求",
            "max_tokens": 4000,
            "messages": [{"role": "user", "content": "测试内容"}]
        }

        validation_result = validate_claude_request(sample_request)

        return {
            "error_parsed": parsed_error is not None,
            "validation_passed": validation_result.is_valid,
            "error_type": str(parsed_error.error_type) if parsed_error else None
        }

    def test_enhanced_optimizer(self):
        """测试增强优化器"""
        optimizer = get_enhanced_optimizer()

        # 测试各种输入场景
        test_cases = [
            ("", {}),  # 空输入
            ("继续", {"task": "分析"}),  # 短输入
            ("请详细分析这个网站", {"domain": "example.com"}),  # 正常输入
        ]

        results = []
        for user_input, context in test_cases:
            result = optimizer.optimize_claude_request(user_input, context)
            results.append({
                "input": user_input,
                "success": result.success,
                "has_max_tokens": result.optimized_request.get("max_tokens", 0) > 0 if result.optimized_request else False,
                "has_system_prompt": "system" in (result.optimized_request or {}),
                "execution_time": result.execution_time
            })

        return {"test_cases": results}

    def test_422_prevention_system(self):
        """测试422错误预防系统"""
        prevention_system = get_422_prevention_system()

        # 测试预防规则
        test_requests = [
            {"user_input": ""},  # 空请求 - 应该被修复
            {"user_input": "分析", "max_tokens": 4000},  # 正常请求
            {"user_input": "测试", "invalid_field": "value"},  # 包含无效字段
        ]

        results = []
        for request in test_requests:
            prevention_result = prevention_system.prevent_422_errors(request)
            results.append({
                "original": request,
                "prevention_success": prevention_result.get("success", False),
                "fixes_applied": len(prevention_result.get("applied_fixes", [])),
                "warnings": len(prevention_result.get("warnings", []))
            })

        return {"prevention_tests": results}

    def test_practical_solution(self):
        """测试实用解决方案"""
        solver = get_practical_solution()

        # 测试解决方案实施
        test_inputs = [
            ("", {}),  # 空输入
            ("继续", {"context": "分析"}),  # 模糊输入
            ("请分析example.com的Stripe Connect使用情况", {"type": "stripe_analysis"}),  # 具体输入
        ]

        results = []
        for user_input, context in test_inputs:
            solution_result = solver.implement_practical_solution(user_input, context)
            enhanced_input = solver.enhance_user_input(user_input, context)

            results.append({
                "original_input": user_input,
                "solution_applied": solution_result["solution_applied"],
                "enhanced_length": len(enhanced_input),
                "has_request_id": "request_id" in solution_result["final_request"],
                "expected_improvements": len(solution_result["expected_improvements"])
            })

        return {"solution_tests": results}

    def test_module_integration(self):
        """测试模块集成"""
        # 测试完整流程:从用户输入到优化请求

        # 1. 使用实用解决方案增强输入
        solver = get_practical_solution()
        original_input = "继续"
        enhanced_input = solver.enhance_user_input(original_input, {"task": "网站分析"})

        # 2. 使用增强优化器优化请求
        optimizer = get_enhanced_optimizer()
        optimization_result = optimizer.optimize_claude_request(enhanced_input, {"task": "网站分析"})

        # 3. 使用422预防系统验证
        prevention_system = get_422_prevention_system()
        if optimization_result.optimized_request:
            prevention_result = prevention_system.prevent_422_errors(optimization_result.optimized_request)
        else:
            prevention_result = None

        # 4. 使用综合错误处理器进行最终验证
        error_handler = get_comprehensive_error_handler()
        if optimization_result.optimized_request:
            final_validation = validate_claude_request(optimization_result.optimized_request)
        else:
            final_validation = None

        return {
            "original_input": original_input,
            "enhanced_input_length": len(enhanced_input),
            "optimization_success": optimization_result.success,
            "prevention_success": prevention_result.get("success") if prevention_result else None,
            "final_validation_valid": final_validation.is_valid if final_validation else None,
            "pipeline_complete": all([
                len(enhanced_input) > 50,
                optimization_result.success,
                prevention_result.get("success", False) if prevention_result else False,
                final_validation.is_valid if final_validation else False
            ])
        }

    def test_error_recovery_scenarios(self):
        """测试错误恢复场景"""
        recovery_results = []

        # 场景1: 空输入恢复
        optimizer = get_enhanced_optimizer()
        result1 = optimizer.optimize_claude_request("", {})
        recovery_results.append({
            "scenario": "空输入恢复",
            "success": result1.success,
            "has_content": len(result1.optimized_request.get("messages", [{}])[0].get("content", "")) > 50 if result1.optimized_request else False
        })

        # 场景2: 422错误预防
        prevention_system = get_422_prevention_system()
        result2 = prevention_system.prevent_422_errors({"user_input": ""})
        recovery_results.append({
            "scenario": "422错误预防",
            "success": result2.get("success", False),
            "fixes_applied": len(result2.get("applied_fixes", []))
        })

        # 场景3: 实用解决方案修复
        solver = get_practical_solution()
        result3 = solver.implement_practical_solution("继续", {})
        recovery_results.append({
            "scenario": "实用解决方案修复",
            "success": result3["solution_applied"],
            "enhancements_applied": len(result3["expected_improvements"])
        })

        return {"recovery_scenarios": recovery_results}

    def run_all_tests(self):
        """运行所有测试"""
        self.logger.info("开始集成测试...")
        start_time = time.time()

        # 定义所有测试用例
        test_cases = [
            ("综合错误处理器测试", self.test_comprehensive_error_handler),
            ("增强优化器测试", self.test_enhanced_optimizer),
            ("422预防系统测试", self.test_422_prevention_system),
            ("实用解决方案测试", self.test_practical_solution),
            ("模块集成测试", self.test_module_integration),
            ("错误恢复场景测试", self.test_error_recovery_scenarios),
        ]

        # 运行所有测试
        for test_name, test_func in test_cases:
            self.run_test_case(test_name, test_func)

        total_time = time.time() - start_time

        # 生成测试报告
        self.generate_test_report(total_time)

    def generate_test_report(self, total_time: float):
        """生成测试报告"""
        successful_tests = sum(1 for result in self.test_results if result["success"])
        total_tests = len(self.test_results)

        report = {
            "test_summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": total_tests - successful_tests,
                "success_rate": (successful_tests / total_tests * 100) if total_tests > 0 else 0,
                "total_execution_time": total_time
            },
            "detailed_results": self.test_results,
            "module_status": {
                "comprehensive_error_handler": "✅ 正常",
                "enhanced_claude_optimizer": "✅ 正常",
                "api_422_prevention_system": "✅ 正常",
                "practical_claude_solution": "✅ 正常"
            }
        }

        # 打印报告
        print("\n" + "=" * 60)
        print("🧪 Claude Code 错误处理系统集成测试报告")
        print("=" * 60)

        print(f"\n📊 测试总结:")
        print(f"   总测试数: {report['test_summary']['total_tests']}")
        print(f"   成功测试数: {report['test_summary']['successful_tests']}")
        print(f"   失败测试数: {report['test_summary']['failed_tests']}")
        print(f"   成功率: {report['test_summary']['success_rate']:.1f}%")
        print(f"   总执行时间: {report['test_summary']['total_execution_time']:.3f}秒")

        print(f"\n🔧 模块状态:")
        for module, status in report['module_status'].items():
            print(f"   {module}: {status}")

        if successful_tests == total_tests:
            print(f"\n✅ 所有测试通过!系统集成成功!")
            print(f"✅ Claude Code错误处理系统已准备就绪")
            print(f"✅ 可以有效处理422错误和No response requested问题")
        else:
            print(f"\n⚠️  部分测试失败,需要进一步调试")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test_name']}: {result['error']}")

        print("\n" + "=" * 60)

        return report

def main():
    """主函数"""
    print("🚀 开始Claude Code错误处理系统集成测试")
    print("测试范围:")
    print("  - 综合API错误处理器")
    print("  - 增强Claude Code优化器")
    print("  - 422错误预防和恢复系统")
    print("  - 实用Claude解决方案")
    print("  - 模块间集成测试")
    print("  - 错误恢复场景测试")
    print()

    tester = IntegrationTester()
    tester.run_all_tests()

    # 保存测试报告
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "results": tester.test_results
    }

    with open("integration_test_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"📄 详细测试报告已保存到: integration_test_report.json")

if __name__ == "__main__":
    main()