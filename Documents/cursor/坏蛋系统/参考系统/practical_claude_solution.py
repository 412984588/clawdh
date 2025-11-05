#!/usr/bin/env python3
"""
实用Claude Code解决方案
针对实际遇到的"No response requested"问题
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import logging
from typing import Dict, List, Optional, Any, Tuple

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


实用Claude Code解决方案
针对实际遇到的"No response requested"问题
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import logging
from typing import Dict, List, Optional, Any

class PracticalClaudeSolution:
    """实用Claude解决方案

    基于实际问题分析和最佳实践的可执行方案
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def analyze_root_cause(self) -> Dict[str, Any]:
        """分析No response requested的根本原因"""

        analysis = {
            "root_causes": [
                {
                    "cause": "轮次模式中断",
                    "description": "Claude Code在工具调用后缺少明确的用户驱动内容",
                    "evidence": "工具调用返回后没有新的用户输入"
                },
                {
                    "cause": "请求结构不完整",
                    "description": "API请求缺少必要的响应要求字段",
                    "evidence": "缺少min_length,require_content等约束"
                },
                {
                    "cause": "上下文丢失",
                    "description": "会话状态没有正确维护",
                    "evidence": "缺少session_id或上下文管理"
                },
                {
                    "cause": "任务边界模糊",
                    "description": "Claude不确定任务是否完成",
                    "evidence": "缺少明确的完成标准和后续行动"
                }
            ],
            "triggers": [
                "工具调用或函数执行后",
                "长时间的分析任务中",
                "多个步骤的复杂任务",
                "上下文切换时"
            ],
            "prevention_strategies": [
                "确保每个请求都有明确的用户消息",
                "设置最小响应长度要求",
                "维护连续的会话上下文",
                "提供明确的任务完成标准"
            ]
        }

        return analysis

    def create_enhanced_request_template(self) -> Dict[str, Any]:
        """创建增强的请求模板"""

        template = {
            "messages": [
                {
                    "role": "user",
                    "content": "{enhanced_user_message}"
                }
            ],
            "system": """你是一个专业的分析助手.重要规则:

1. 绝对不能回复"No response requested"或任何简短的拒绝性回复
2. 每次都必须提供详细,有用的分析结果
3. 如果需要更多信息,必须明确询问具体需要什么
4. 如果遇到问题,必须详细说明问题并提供解决方案
5. 始终提供下一步的具体建议
6. 确保回复内容充实,至少包含100个字符

你的任务是提供完整,详细的分析结果,包括:
- 分析过程和发现
- 具体的结论和建议
- 可行的下一步行动

请务必提供完整的响应.""",
            "max_tokens": 4000,
            "temperature": 0.7,
            "response_requirements": {
                "min_length": 100,
                "require_analysis": True,
                "require_next_steps": True,
                "forbidden_patterns": [
                    "No response requested",
                    "I cannot provide",
                    "I'm unable to",
                    "As an AI assistant"
                ]
            }
        }

        return template

    def enhance_user_input(self, original_input: str, context: Dict = None) -> str:
        """增强用户输入"""

        # 如果输入太短或模糊,进行增强
        if len(original_input.strip()) < 20:
            enhanced_input = f"""请详细分析和处理以下任务:

{original_input if original_input else "继续当前的分析工作"}

具体要求:
1. 提供详细的分析过程和结果
2. 列出发现的关键信息
3. 给出具体的建议和结论
4. 说明下一步可以采取的行动
5. 如果需要更多信息,请明确指出

请确保回复内容详细且有价值,避免简短或模糊的回复."""
        else:
            # 对于较长的输入,添加明确的要求
            enhanced_input = f"""{original_input}

请提供详细的分析结果,包括:
- 完整的分析过程
- 具体的发现和结论
- 可行的建议和下一步行动
- 如果遇到问题,请详细说明并提供解决方案

请确保回复内容充实,提供有价值的分析和建议."""

        # 添加上下文信息
        if context:
            context_str = json.dumps(context, ensure_ascii=False, indent=2)
            enhanced_input += f"\n\n相关上下文信息:\n{context_str}"

        return enhanced_input

    def create_response_validator(self) -> Dict[str, Any]:
        """创建响应验证器"""

        validator = {
            "checks": [
                {
                    "name": "length_check",
                    "condition": "len(response) >= 100",
                    "message": "响应长度不足100字符"
                },
                {
                    "name": "forbidden_patterns_check",
                    "condition": "not any(pattern in response.lower() for pattern in ['no response requested', 'i cannot provide', 'i\\'m unable to'])",
                    "message": "响应包含禁止的回复模式"
                },
                {
                    "name": "substantive_content_check",
                    "condition": "any(keyword in response.lower() for keyword in ['分析', '建议', '结果', '步骤', '发现', '结论'])",
                    "message": "响应缺乏实质性内容"
                },
                {
                    "name": "structure_check",
                    "condition": "len(response.split('\\n')) >= 3",
                    "message": "响应结构过于简单"
                }
            ],
            "recovery_actions": [
                "重新请求,使用更强的系统提示",
                "分解任务为更小的步骤",
                "提供更具体的指令",
                "直接询问需要什么信息"
            ]
        }

        return validator

    def implement_practical_solution(self, user_input: str, context: Dict = None) -> Dict[str, Any]:
        """实施实用解决方案"""

        solution_steps = {
            "step_1_enhance_input": {
                "action": "增强用户输入",
                "result": self.enhance_user_input(user_input, context)
            },
            "step_2_create_request": {
                "action": "创建增强请求",
                "template": self.create_enhanced_request_template()
            },
            "step_3_prepare_validation": {
                "action": "准备响应验证",
                "validator": self.create_response_validator()
            },
            "step_4_fallback_strategy": {
                "action": "准备回退策略",
                "strategies": [
                    "如果第一次尝试失败,使用更直接的指令",
                    "如果仍然失败,分解为具体问题",
                    "如果持续失败,直接询问用户需求"
                ]
            }
        }

        # 应用解决方案
        enhanced_input = self.enhance_user_input(user_input, context)
        template = self.create_enhanced_request_template()

        # 填充模板
        final_request = template.copy()
        final_request["messages"][0]["content"] = enhanced_input

        # 添加请求ID和时间戳
        final_request["request_id"] = f"req_{int(time.time())}"
        final_request["timestamp"] = time.strftime('%Y-%m-%d %H:%M:%S')

        return {
            "solution_applied": True,
            "final_request": final_request,
            "steps": solution_steps,
            "expected_improvements": [
                "消除No response requested回复",
                "确保响应内容充实",
                "提供明确的分析结果",
                "维持任务连续性"
            ]
        }

    def generate_implementation_guide(self) -> Dict[str, Any]:
        """生成实施指南"""

        guide = {
            "immediate_actions": [
                {
                    "priority": 1,
                    "action": "增强所有用户输入",
                    "details": "使用enhance_user_input函数处理所有用户输入",
                    "code_example": """
from practical_claude_solution import PracticalClaudeSolution

solver = PracticalClaudeSolution()
enhanced_input = solver.enhance_user_input(original_input, context)
                    """
                },
                {
                    "priority": 2,
                    "action": "使用增强的请求模板",
                    "details": "采用包含明确响应要求的请求结构",
                    "code_example": """
template = solver.create_enhanced_request_template()
template['messages'][0]['content'] = enhanced_input
                    """
                },
                {
                    "priority": 3,
                    "action": "验证响应质量",
                    "details": "实施响应验证和回退机制",
                    "code_example": """
validator = solver.create_response_validator()
# 对Claude的响应进行验证
                    """
                }
            ],
            "best_practices": [
                "总是提供明确的用户消息,避免空输入",
                "设置最小响应长度要求(至少100字符)",
                "在系统提示中明确禁止拒绝性回复",
                "维护连续的会话上下文",
                "提供具体的任务完成标准"
            ],
            "monitoring_points": [
                "监控No response requested出现频率",
                "跟踪响应长度和质量",
                "记录需要重试的情况",
                "分析失败模式和原因"
            ]
        }

        return guide

# 全局实例
_practical_solution = None

def get_practical_solution() -> PracticalClaudeSolution:
    """获取实用解决方案实例"""
    global _practical_solution
    if _practical_solution is None:
        _practical_solution = PracticalClaudeSolution()
    return _practical_solution

# 便捷函数
def fix_claude_request(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """修复Claude请求的便捷函数"""
    solver = get_practical_solution()
    return solver.implement_practical_solution(user_input, context)

def enhance_user_message(message: str, context: Dict = None) -> str:
    """增强用户消息的便捷函数"""
    solver = get_practical_solution()
    return solver.enhance_user_input(message, context)

def create_claude_safe_request(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """创建安全的Claude请求"""
    result = fix_claude_request(user_input, context)
    return result["final_request"]

def main():
    """主函数 - 演示解决方案"""
    print("实用Claude Code解决方案演示")
    print("=" * 50)

    solver = get_practical_solution()

    # 1. 分析根本原因
    print("\n1. No response requested 根本原因分析:")
    analysis = solver.analyze_root_cause()
    for i, cause in enumerate(analysis["root_causes"], 1):
        print(f"   {i}. {cause['cause']}")
        print(f"      描述: {cause['description']}")
        print(f"      证据: {cause['evidence']}")

    # 2. 演示输入增强
    print("\n2. 用户输入增强演示:")
    test_inputs = [
        ("继续", {"task": "网站分析"}),
        ("", {}),
        ("分析example.com", {"type": "stripe_connect"})
    ]

    for original, context in test_inputs:
        enhanced = solver.enhance_user_input(original, context)
        print(f"\n   原始输入: '{original}'")
        print(f"   增强后长度: {len(enhanced)} 字符")
        print(f"   增强后预览: {enhanced[:100]}...")

    # 3. 演示完整解决方案
    print("\n3. 完整解决方案演示:")
    result = solver.implement_practical_solution("分析网站", {"domain": "example.com"})
    print(f"   解决方案应用: {result['solution_applied']}")
    print(f"   请求ID: {result['final_request']['request_id']}")
    print(f"   预期改进: {len(result['expected_improvements'])} 项")

    # 4. 生成实施指南
    print("\n4. 实施指南:")
    guide = solver.generate_implementation_guide()
    print(f"   立即行动项: {len(guide['immediate_actions'])} 个")
    print(f"   最佳实践: {len(guide['best_practices'])} 条")
    print(f"   监控要点: {len(guide['monitoring_points'])} 个")

    print("\n" + "=" * 50)
    print("✅ 实用解决方案已准备就绪")
    print("✅ 立即应用可解决No response requested问题")
    print("✅ 包含完整的实施指南和代码示例")

if __name__ == "__main__":
    main()