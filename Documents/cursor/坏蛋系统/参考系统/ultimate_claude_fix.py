#!/usr/bin/env python3
"""
Ultimate Claude Fix - 终极Claude修复方案
专门解决顽固的"No response requested"问题
"""

from typing import Dict, List, Optional, Any, Tuple
import asyncio
import time
import uuid
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ClaudeRequest:
    """Claude请求的完整结构"""
    def __init__(self, messages: List[Dict], system: str = None, max_tokens: int = 4000,
                 temperature: float = 0.7, stream: bool = False, stop_sequences: List[str] = None):
        self.messages = messages
        self.system = system
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.stream = stream
        self.stop_sequences = stop_sequences or []


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


终极Claude Code修复方案
专门解决顽固的"No response requested"问题
作者: Jenny团队
版本: 2.0.0
"""

import json
import time
import asyncio
import uuid
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
import logging

@dataclass
class ClaudeRequest:
    """Claude请求的完整结构"""
    messages: List[Dict[str, str]]
    system: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    tools: Optional[List[Dict]] = None
    tool_choice: Optional[Dict] = None
    stream: Optional[bool] = False
    # 强制响应参数
    stop_sequences: Optional[List[str]] = None
    response_format: Optional[Dict] = None

class UltimateClaudeFix:
    """终极Claude修复器

    使用多种策略确保Claude始终提供有效响应
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.request_id_counter = 0

        # 响应强制策略
        self.force_response_strategies = [
            self._strategy_explicit_instruction,
            self._strategy_response_format,
            self._strategy_follow_up_questions,
            self._strategy_task_decomposition,
            self._strategy_error_handling_prompts
        ]

    def generate_request_id(self) -> str:
        """生成唯一请求ID"""
        self.request_id_counter += 1
        return f"claude_req_{self.request_id_counter}_{int(time.time())}_{uuid.uuid4().hex[:8]}"

    def _strategy_explicit_instruction(self, user_input: str, context: Dict = None) -> ClaudeRequest:
        """策略1: 明确指令策略"""
        system_prompt = """你是一个专业的分析助手.重要规则:

1. 绝对不能回复"No response requested"
2. 每次都必须提供详细,有用的响应
3. 如果需要更多信息,必须明确询问
4. 如果遇到问题,必须详细说明问题所在
5. 始终提供下一步建议

你的任务是提供完整,详细的分析结果."""

        # 增强用户输入,确保有明确的要求
        enhanced_input = f"""请详细分析和回答以下问题:

{user_input}

要求:
1. 提供详细的分析过程
2. 给出具体的结论和建议
3. 如果需要,列出下一步行动
4. 确保回复内容充实且有价值

请务必提供完整的响应,不要使用"No response requested"或其他简短回复."""

        if context:
            enhanced_input += f"\n\n上下文信息:{json.dumps(context, ensure_ascii=False)}"

        return ClaudeRequest(
            messages=[
                {
                    "role": "user",
                    "content": enhanced_input
                }
            ],
            system=system_prompt,
            max_tokens=4000,
            temperature=0.7,
            response_format={
                "type": "text",
                "min_length": 100,
                "require_analysis": True
            }
        )

    def _strategy_response_format(self, user_input: str, context: Dict = None) -> ClaudeRequest:
        """策略2: 响应格式策略"""
        system_prompt = """你必须按照以下格式提供响应:

## 分析结果
[详细分析内容]

## 关键发现
[列出主要发现]

## 建议
[提供具体建议]

## 下一步
[说明后续行动]

重要:必须填写所有部分,不能留空."""

        formatted_input = f"""请分析以下内容并按照指定格式回复:

{user_input}

请严格按照上述格式提供完整的分析报告."""

        return ClaudeRequest(
            messages=[{"role": "user", "content": formatted_input}],
            system=system_prompt,
            max_tokens=4000,
            temperature=0.5
        )

    def _strategy_follow_up_questions(self, user_input: str, context: Dict = None) -> ClaudeRequest:
        """策略3: 追问策略"""
        system_prompt = """如果用户的请求不够明确,你必须:

1. 指出需要澄清的具体方面
2. 提供可能的假设和分析方向
3. 询问用户是否需要针对某个方面深入分析
4. 基于现有信息提供初步分析

绝对不能说"No response requested"."""

        enhanced_input = f"""基于以下请求,请提供分析:

{user_input}

如果需要更多信息,请明确指出需要哪些具体信息.
如果可以基于现有信息分析,请提供初步结果.

无论如何,都必须提供有价值的响应."""

        return ClaudeRequest(
            messages=[{"role": "user", "content": enhanced_input}],
            system=system_prompt,
            max_tokens=3000,
            temperature=0.6
        )

    def _strategy_task_decomposition(self, user_input: str, context: Dict = None) -> ClaudeRequest:
        """策略4: 任务分解策略"""
        system_prompt = """将任何请求分解为具体步骤:

1. 理解请求意图
2. 识别关键信息需求
3. 提供分步分析
4. 总结结果和建议

每个步骤都要有详细说明."""

        decomposed_input = f"""请将以下任务分解执行:

任务:{user_input}

请按照步骤1-4进行详细分析,每个步骤都要有具体内容."""

        return ClaudeRequest(
            messages=[{"role": "user", "content": decomposed_input}],
            system=system_prompt,
            max_tokens=3500,
            temperature=0.4
        )

    def _strategy_error_handling_prompts(self, user_input: str, context: Dict = None) -> ClaudeRequest:
        """策略5: 错误处理策略"""
        system_prompt = """如果遇到任何问题(如信息不足,技术问题等),你必须:

1. 明确说明遇到的具体问题
2. 解释为什么会出现这个问题
3. 提供可能的解决方案
4. 建议用户如何提供更好的信息

绝对不能因为遇到问题就简短回复."""

        robust_input = f"""请处理以下请求:

{user_input}

如果遇到任何困难,请详细说明问题并提供解决方案.
如果一切正常,请提供完整的分析结果.

请求ID: {self.generate_request_id()}
时间戳: {time.strftime('%Y-%m-%d %H:%M:%S')}"""

        return ClaudeRequest(
            messages=[{"role": "user", "content": robust_input}],
            system=system_prompt,
            max_tokens=4000,
            temperature=0.5
        )

    def create_robust_request(self, user_input: str, context: Dict = None, strategy_index: int = 0) -> ClaudeRequest:
        """创建强健的Claude请求"""

        # 确保用户输入不为空
        if not user_input or len(user_input.strip()) < 3:
            user_input = "请提供详细的任务分析和建议.我需要您帮助处理当前的工作任务."

        # 选择策略
        strategy = self.force_response_strategies[strategy_index % len(self.force_response_strategies)]

        # 创建请求
        request = strategy(user_input, context)

        # 添加通用强化参数
        request.stream = False
        request.stop_sequences = ["No response requested", "I cannot provide", "I'm unable to"]

        self.logger.info(f"创建强健请求,策略{strategy_index}, 输入长度: {len(user_input)}")

        return request

    def validate_response(self, response_content: str) -> Dict[str, Any]:
        """验证响应质量"""
        validation_result = {
            "is_valid": True,
            "is_substantive": False,
            "needs_retry": False,
            "issues": [],
            "quality_score": 0,
            "recommendations": []
        }

        if not response_content:
            validation_result["is_valid"] = False
            validation_result["needs_retry"] = True
            validation_result["issues"].append("响应为空")
            return validation_result

        # 检查无效响应
        invalid_patterns = [
            "no response requested",
            "i cannot provide",
            "i'm unable to",
            "i cannot assist",
            "作为ai助手",
            "我是一个ai助手",
            "我无法提供"
        ]

        content_lower = response_content.lower()
        for pattern in invalid_patterns:
            if pattern in content_lower:
                validation_result["is_valid"] = False
                validation_result["needs_retry"] = True
                validation_result["issues"].append(f"包含无效响应模式: {pattern}")
                break

        # 检查响应长度
        if len(response_content) < 50:
            validation_result["is_substantive"] = False
            validation_result["issues"].append("响应过短")
            validation_result["needs_retry"] = True
        elif len(response_content) > 200:
            validation_result["is_substantive"] = True

        # 计算质量分数
        quality_score = 0
        if validation_result["is_valid"]:
            quality_score += 30
        if validation_result["is_substantive"]:
            quality_score += 40
        if len(response_content) > 500:
            quality_score += 20
        if any(keyword in content_lower for keyword in ["分析", "建议", "结果", "步骤"]):
            quality_score += 10

        validation_result["quality_score"] = min(quality_score, 100)

        # 生成建议
        if validation_result["needs_retry"]:
            validation_result["recommendations"].append("需要重新请求,使用不同的策略")
        if not validation_result["is_substantive"]:
            validation_result["recommendations"].append("请求需要更具体的内容")
        if quality_score < 60:
            validation_result["recommendations"].append("响应质量需要改进")

        return validation_result

    async def execute_with_fallback(self, user_input: str, context: Dict = None, max_attempts: int = 5) -> Dict[str, Any]:
        """带回退机制的执行"""

        results = {
            "success": False,
            "response": None,
            "attempts": 0,
            "strategy_used": None,
            "validation": None,
            "error": None
        }

        for attempt in range(max_attempts):
            results["attempts"] = attempt + 1

            try:
                # 创建请求
                request = self.create_robust_request(user_input, context, attempt)
                results["strategy_used"] = attempt % len(self.force_response_strategies)

                # 模拟API调用(这里应该是实际的Claude API调用)
                response_content = await self._simulate_claude_api_call(request)

                # 验证响应
                validation = self.validate_response(response_content)
                results["validation"] = validation

                if validation["is_valid"] and validation["is_substantive"]:
                    results["success"] = True
                    results["response"] = response_content
                    self.logger.info(f"成功获得响应,尝试次数: {attempt + 1}, 质量分数: {validation['quality_score']}")
                    break
                else:
                    self.logger.warning(f"响应质量不佳,尝试 {attempt + 1}/{max_attempts}, 问题: {validation['issues']}")

                    # 如果不是最后一次尝试,继续
                    if attempt < max_attempts - 1:
                        await asyncio.sleep(1)  # 短暂等待
                        continue

            except Exception as e:
                results["error"] = str(e)
                self.logger.error(f"API调用失败,尝试 {attempt + 1}/{max_attempts}: {e}")

                if attempt < max_attempts - 1:
                    await asyncio.sleep(2 ** attempt)  # 指数退避
                    continue

        return results

    async def _simulate_claude_api_call(self, request: ClaudeRequest) -> str:
        """模拟Claude API调用(实际使用时替换为真实API调用)"""

        # 这里应该调用真实的Claude API
        # 现在为了演示,返回模拟响应

        # 模拟不同的响应质量
        import random
        rand = random.random()

        if rand < 0.1:  # 10% 概率返回无效响应
            return "No response requested."
        elif rand < 0.2:  # 10% 概率返回短响应
            return "好的,已收到您的请求."
        else:  # 80% 概率返回详细响应
            return f"""基于您的请求,我进行了详细分析:

## 分析结果
您提到的内容我已经仔细分析,发现了以下关键点...

## 关键发现
1. 第一个重要发现
2. 第二个重要发现
3. 第三个重要发现

## 建议
根据分析结果,我建议您采取以下措施...

## 下一步
接下来您可以...

这是一个详细的分析响应,确保避免了"No response requested"问题.请求ID: {self.generate_request_id()}"""

# 全局实例
_ultimate_fix = None

def get_ultimate_claude_fix() -> UltimateClaudeFix:
    """获取终极Claude修复器实例"""
    global _ultimate_fix
    if _ultimate_fix is None:
        _ultimate_fix = UltimateClaudeFix()
    return _ultimate_fix

# 便捷函数
async def get_claude_response_guaranteed(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """保证获得Claude响应的便捷函数"""
    fixer = get_ultimate_claude_fix()
    result = await fixer.execute_with_fallback(user_input, context)
    return result

def create_ultimate_claude_request(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """创建终极Claude请求的便捷函数"""
    fixer = get_ultimate_claude_fix()
    request = fixer.create_robust_request(user_input, context)

    # 转换为字典格式,便于API调用
    return {
        "messages": request.messages,
        "system": request.system,
        "max_tokens": request.max_tokens,
        "temperature": request.temperature,
        "stream": request.stream,
        "stop_sequences": request.stop_sequences
    }

# 测试函数
async def test_ultimate_fix():
    """测试终极修复方案"""
    print("测试终极Claude修复方案...")

    test_cases = [
        ("分析网站", {"domain": "example.com"}),
        ("继续", {}),
        ("", {}),
        ("请提供详细的分析报告", {"topic": "技术分析"})
    ]

    fixer = get_ultimate_claude_fix()

    for i, (user_input, context) in enumerate(test_cases):
        print(f"\n测试用例 {i+1}: '{user_input}'")

        result = await fixer.execute_with_fallback(user_input, context)

        if result["success"]:
            print(f"✅ 成功,尝试次数: {result['attempts']}")
            print(f"响应长度: {len(result['response'])} 字符")
            print(f"质量分数: {result['validation']['quality_score']}")
        else:
            print(f"❌ 失败,尝试次数: {result['attempts']}")
            if result["error"]:
                print(f"错误: {result['error']}")
            if result["validation"]:
                print(f"问题: {result['validation']['issues']}")

if __name__ == "__main__":
    # 运行测试
    asyncio.run(test_ultimate_fix())