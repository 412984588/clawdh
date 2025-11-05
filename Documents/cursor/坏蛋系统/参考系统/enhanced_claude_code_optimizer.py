#!/usr/bin/env python3
"""
增强的Claude Code优化器
集成全面的API错误处理,专门处理422和No response requested错误
作者: Jenny团队
版本: 3.0.0 - 全面修复版
"""

import asyncio
import json
import time
import logging
from typing import Dict, List, Optional, Any, Callable, Union
from dataclasses import dataclass
import uuid

# 导入我们的综合错误处理器
from comprehensive_api_error_handler import (
    ComprehensiveAPIErrorHandler,
    APIRequest,
    APIError,
    ErrorType,
    ValidationError,
    ValidationResult,
    get_comprehensive_error_handler,
    safe_api_call,
    validate_claude_request,
    create_safe_claude_request
)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """优化结果"""
    success: bool
    optimized_request: Optional[Dict] = None
    validation_result: Optional[ValidationResult] = None
    error_details: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    execution_time: float = 0.0
    attempts: int = 0


class EnhancedClaudeCodeOptimizer:
    """增强的Claude Code优化器
    提供全面的API错误处理和自动修复功能
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_handler = get_comprehensive_error_handler()
        self.optimization_history = []

    def optimize_claude_request(self, user_input: str, context: Dict = None, **kwargs) -> OptimizationResult:
        """优化Claude请求,处理422和No response requested错误"""
        start_time = time.time()

        try:
            # 1. 创建基础请求
            base_request_data = self._create_base_request_data(user_input, context, **kwargs)

            # 2. 验证请求数据
            validation_result = validate_claude_request(base_request_data)

            # 3. 如果验证失败,尝试自动修复
            if not validation_result.is_valid:
                fixed_request_data = self._auto_fix_validation_errors(base_request_data, validation_result)
                if fixed_request_data:
                    base_request_data = fixed_request_data
                    # 重新验证修复后的数据
                    validation_result = validate_claude_request(base_request_data)

            # 4. 增强请求以防止No response requested
            enhanced_request_data = self._enhance_for_no_response_prevention(base_request_data)

            # 5. 最终验证
            final_validation = validate_claude_request(enhanced_request_data)

            execution_time = time.time() - start_time

            result = OptimizationResult(
                success=final_validation.is_valid,
                optimized_request=enhanced_request_data if final_validation.is_valid else None,
                validation_result=final_validation,
                error_details=[e.message for e in final_validation.errors] if final_validation.errors else [],
                suggestions=final_validation.suggestions if final_validation.suggestions else [],
                execution_time=execution_time,
                attempts=1
            )

            # 记录优化历史
            self.optimization_history.append({
                "timestamp": time.time(),
                "user_input": user_input,
                "success": result.success,
                "execution_time": execution_time,
                "validation_errors": len(final_validation.errors) if final_validation.errors else 0
            })

            return result

        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"请求优化失败: {e}")

            return OptimizationResult(
                success=False,
                error_details=[str(e)],
                execution_time=execution_time,
                attempts=1
            )

    def _create_base_request_data(self, user_input: str, context: Dict = None, **kwargs) -> Dict:
        """创建基础请求数据"""
        # 确保用户输入不为空
        if not user_input or len(user_input.strip()) < 3:
            user_input = "请详细执行当前任务并提供结果"

        base_data = {
            "model": kwargs.get("model", "claude-3-5-sonnet-20240620"),
            "max_tokens": kwargs.get("max_tokens", 4000),
            "messages": [
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            "temperature": kwargs.get("temperature", 0.7)
        }

        # 添加上下文信息
        if context:
            context_str = json.dumps(context, ensure_ascii=False)
            base_data["messages"][0]["content"] += f"\n\n上下文信息:\n{context_str}"

        # 添加其他参数
        optional_params = ["system", "stop_sequences", "stream", "top_p", "top_k"]
        for param in optional_params:
            if param in kwargs:
                base_data[param] = kwargs[param]

        return base_data

    def _auto_fix_validation_errors(self, request_data: Dict, validation_result: ValidationResult) -> Optional[Dict]:
        """自动修复验证错误"""
        fixed_data = request_data.copy()
        fixes_applied = []

        for error in validation_result.errors:
            if error.field == "max_tokens":
                fixed_data["max_tokens"] = 4000
                fixes_applied.append("设置max_tokens为4000")

            elif error.field == "messages" and "required" in error.message.lower():
                if not fixed_data.get("messages") or len(fixed_data["messages"]) == 0:
                    fixed_data["messages"] = [
                        {
                            "role": "user",
                            "content": "请详细执行当前任务并提供结果"
                        }
                    ]
                    fixes_applied.append("添加默认消息")

            elif "empty" in error.message.lower():
                if "messages" in fixed_data and len(fixed_data["messages"]) > 0:
                    if not fixed_data["messages"][0].get("content"):
                        fixed_data["messages"][0]["content"] = "请详细执行当前任务并提供结果"
                        fixes_applied.append("修复空消息内容")

        if fixes_applied:
            self.logger.info(f"应用自动修复: {fixes_applied}")
            return fixed_data

        return None

    def _enhance_for_no_response_prevention(self, request_data: Dict) -> Dict:
        """增强请求以防止No response requested错误"""
        enhanced_data = request_data.copy()

        # 确保有明确的max_tokens
        if "max_tokens" not in enhanced_data or enhanced_data["max_tokens"] <= 0:
            enhanced_data["max_tokens"] = 4000

        # 增强用户消息内容
        if "messages" in enhanced_data and len(enhanced_data["messages"]) > 0:
            current_content = enhanced_data["messages"][0].get("content", "")

            # 如果消息太短,进行增强
            if len(current_content.strip()) < 50:
                enhanced_content = f"""请详细分析和处理以下任务:

{current_content}

具体要求:
1. 提供详细的分析过程和结果
2. 列出发现的关键信息
3. 给出具体的建议和结论
4. 说明下一步可以采取的行动
5. 如果需要更多信息,请明确指出

重要: 请务必提供完整的响应,不要使用"No response requested"或其他简短回复.
确保回复内容详细且有价值."""

                enhanced_data["messages"][0]["content"] = enhanced_content

        # 添加停止序列
        if "stop_sequences" not in enhanced_data:
            enhanced_data["stop_sequences"] = [
                "No response requested",
                "I cannot provide",
                "I'm unable to",
                "As an AI assistant"
            ]

        # 添加系统提示(如果没有的话)
        if "system" not in enhanced_data:
            enhanced_data["system"] = """你是一个专业的分析助手.重要规则:

1. 绝对不能回复"No response requested"或任何简短的拒绝性回复
2. 每次都必须提供详细,有用的分析结果
3. 如果需要更多信息,必须明确询问具体需要什么
4. 如果遇到问题,必须详细说明问题并提供解决方案
5. 始终提供下一步的具体建议
6. 确保回复内容充实,至少包含100个字符

你的任务是提供完整,详细的分析结果."""

        return enhanced_data

    async def execute_optimized_request(self, user_input: str, api_func: Callable, context: Dict = None, **kwargs) -> Dict[str, Any]:
        """执行优化后的请求"""
        # 1. 优化请求
        optimization_result = self.optimize_claude_request(user_input, context, **kwargs)

        if not optimization_result.success:
            return {
                "success": False,
                "error": "请求优化失败",
                "details": optimization_result.error_details,
                "suggestions": optimization_result.suggestions
            }

        # 2. 创建API请求对象
        api_request = APIRequest(
            url="https://api.anthropic.com/v1/messages",
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": kwargs.get("api_key", ""),
                "anthropic-version": "2023-06-01"
            },
            data=optimization_result.optimized_request,
            max_retries=kwargs.get("max_retries", 5)
        )

        # 3. 执行API调用
        execution_result = await safe_api_call(api_request, api_func)

        # 4. 合并结果
        final_result = {
            "success": execution_result["success"],
            "response": execution_result.get("response"),
            "optimization_result": optimization_result,
            "execution_result": execution_result,
            "total_attempts": optimization_result.attempts + execution_result.get("attempts", 0) - 1,
            "total_execution_time": optimization_result.execution_time + execution_result.get("execution_time", 0)
        }

        return final_result

    def batch_optimize_requests(self, requests: List[Dict[str, Any]]) -> List[OptimizationResult]:
        """批量优化请求"""
        results = []

        for i, req in enumerate(requests):
            self.logger.info(f"优化请求 {i+1}/{len(requests)}")

            user_input = req.get("user_input", "")
            context = req.get("context")
            kwargs = {k: v for k, v in req.items() if k not in ["user_input", "context"]}

            result = self.optimize_claude_request(user_input, context, **kwargs)
            results.append(result)

        return results

    def get_optimization_statistics(self) -> Dict[str, Any]:
        """获取优化统计信息"""
        if not self.optimization_history:
            return {
                "total_optimizations": 0,
                "success_rate": 0,
                "average_execution_time": 0,
                "average_validation_errors": 0
            }

        total = len(self.optimization_history)
        successful = sum(1 for h in self.optimization_history if h["success"])
        total_time = sum(h["execution_time"] for h in self.optimization_history)
        total_errors = sum(h["validation_errors"] for h in self.optimization_history)

        return {
            "total_optimizations": total,
            "successful_optimizations": successful,
            "success_rate": successful / total * 100,
            "average_execution_time": total_time / total,
            "average_validation_errors": total_errors / total,
            "recent_optimizations": self.optimization_history[-10:]  # 最近10次
        }

    def create_comprehensive_fix_report(self) -> Dict[str, Any]:
        """创建全面的修复报告"""
        stats = self.get_optimization_statistics()

        report = {
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "optimizer_version": "3.0.0",
            "statistics": stats,
            "capabilities": {
                "error_types_handled": [
                    "422 Unprocessable Entity",
                    "No response requested",
                    "Validation errors",
                    "Business rule errors",
                    "Rate limit errors",
                    "Network errors"
                ],
                "auto_fix_features": [
                    "Missing max_tokens addition",
                    "Empty message enhancement",
                    "Chinese punctuation correction",
                    "Request structure optimization",
                    "Stop sequences addition",
                    "System prompt enhancement"
                ],
                "validation_rules": [
                    "Required field validation",
                    "Data type validation",
                    "Value range validation",
                    "Format validation",
                    "Business rule validation"
                ]
            },
            "recommendations": [
                "始终包含max_tokens参数(建议4000)",
                "确保用户消息内容详细且明确",
                "使用适当的错误处理和重试机制",
                "验证请求数据 before API调用",
                "监控422错误和No response requested频率"
            ]
        }

        return report


# 全局实例
_optimizer = None

def get_enhanced_optimizer() -> EnhancedClaudeCodeOptimizer:
    """获取增强优化器实例"""
    global _optimizer
    if _optimizer is None:
        _optimizer = EnhancedClaudeCodeOptimizer()
    return _optimizer

# 便捷函数
def optimize_claude_code_request(user_input: str, context: Dict = None, **kwargs) -> OptimizationResult:
    """优化Claude Code请求的便捷函数"""
    optimizer = get_enhanced_optimizer()
    return optimizer.optimize_claude_request(user_input, context, **kwargs)

async def safe_claude_api_call(user_input: str, api_func: Callable, context: Dict = None, **kwargs) -> Dict[str, Any]:
    """安全的Claude API调用便捷函数"""
    optimizer = get_enhanced_optimizer()
    return await optimizer.execute_optimized_request(user_input, api_func, context, **kwargs)

def create_optimized_claude_request(user_input: str, **kwargs) -> Dict[str, Any]:
    """创建优化的Claude请求的便捷函数"""
    result = optimize_claude_code_request(user_input, **kwargs)
    if result.success:
        return result.optimized_request
    else:
        raise ValueError(f"请求优化失败: {result.error_details}")


if __name__ == "__main__":
    # 测试代码
    async def test_enhanced_optimizer():
        """测试增强优化器"""
        print("测试增强的Claude Code优化器...")

        optimizer = get_enhanced_optimizer()

        # 测试用例
        test_cases = [
            {
                "name": "正常请求",
                "user_input": "请分析这个网站并提供详细报告",
                "context": {"domain": "example.com"}
            },
            {
                "name": "空输入",
                "user_input": "",
                "context": None
            },
            {
                "name": "短输入",
                "user_input": "继续",
                "context": {"task": "网站分析"}
            },
            {
                "name": "带特殊参数",
                "user_input": "请分析数据",
                "context": None,
                "temperature": 0.5,
                "max_tokens": 2000
            }
        ]

        for i, test_case in enumerate(test_cases):
            print(f"\n测试用例 {i+1}: {test_case['name']}")
            print(f"输入: '{test_case['user_input']}'")

            # 执行优化
            result = optimizer.optimize_claude_request(
                test_case["user_input"],
                test_case["context"],
                **{k: v for k, v in test_case.items() if k not in ["name", "user_input", "context"]}
            )

            print(f"优化成功: {result.success}")
            print(f"执行时间: {result.execution_time:.3f}秒")

            if result.success:
                request_data = result.optimized_request
                print(f"max_tokens: {request_data.get('max_tokens')}")
                print(f"消息长度: {len(request_data['messages'][0]['content'])} 字符")
                if "system" in request_data:
                    print(f"包含系统提示: 是")
                if "stop_sequences" in request_data:
                    print(f"停止序列: {request_data['stop_sequences']}")
            else:
                print(f"错误: {result.error_details}")
                print(f"建议: {result.suggestions}")

        # 生成统计报告
        print(f"\n优化统计:")
        stats = optimizer.get_optimization_statistics()
        print(f"总优化次数: {stats['total_optimizations']}")
        print(f"成功率: {stats['success_rate']:.1f}%")
        print(f"平均执行时间: {stats['average_execution_time']:.3f}秒")

        # 生成全面修复报告
        print(f"\n全面修复报告:")
        report = optimizer.create_comprehensive_fix_report()
        print(f"处理的错误类型: {len(report['capabilities']['error_types_handled'])}")
        print(f"自动修复功能: {len(report['capabilities']['auto_fix_features'])}")
        print(f"验证规则: {len(report['capabilities']['validation_rules'])}")

        print("\n✅ 增强Claude Code优化器测试完成")

    # 运行测试
    asyncio.run(test_enhanced_optimizer())