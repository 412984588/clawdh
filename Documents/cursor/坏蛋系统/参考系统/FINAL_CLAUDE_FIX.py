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


最终Claude Code修复方案
专门解决顽固的"No response requested"问题
基于实际问题分析和最佳实践
作者: Jenny团队
版本: Final 3.0.0
"""

import json
import time
import uuid
import logging
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass

@dataclass
class ClaudeSafeRequest:
    """安全的Claude请求结构"""
    user_message: str
    system_prompt: str
    context: Dict[str, Any]
    session_id: str
    force_response: bool = True
    min_response_length: int = 150
    max_tokens: int = 4000

class FinalClaudeFix:
    """最终Claude修复器

    基于深入分析的实际可执行解决方案
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.session_counter = 0

    def create_safe_session_id(self) -> str:
        """创建安全的会话ID"""
        self.session_counter += 1
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        return f"claude_session_{timestamp}_{self.session_counter}_{unique_id}"

    def create_comprehensive_system_prompt(self) -> str:
        """创建全面的系统提示"""
        return """你是专业的分析助手.严格按照以下规则工作:

🚫 绝对禁止的行为:
- 绝对不能回复"No response requested"
- 绝对不能回复"作为AI助手"或类似的身份说明
- 绝对不能回复简短,模糊或拒绝性的内容
- 绝对不能说"我无法提供"或"我不能帮助"

✅ 必须做到的行为:
- 每次都必须提供详细,充实的分析内容
- 回复长度必须超过150个字符
- 必须包含具体的分析过程和结果
- 必须提供明确的建议和下一步行动
- 如果需要更多信息,必须具体说明需要什么

📋 响应结构要求:
1. 分析过程和发现
2. 具体结论和结果
3. 可行的建议和方案
4. 下一步行动计划

🔄 如果你收到模糊请求:
- 基于上下文做出合理假设
- 提供多种可能的分析方向
- 询问用户需要深入哪个方面
- 绝不因为信息不足而简短回复

记住:用户需要的是有价值的分析和建议,不是借口或拒绝."""

    def enhance_user_input_comprehensively(self, original_input: str, context: Dict = None) -> str:
        """全面增强用户输入"""

        # 处理空输入或极短输入
        if not original_input or len(original_input.strip()) < 5:
            original_input = "请继续当前的分析工作,提供详细的结果和建议"

        # 基础增强框架
        enhancement_framework = f"""请对以下内容进行详细分析:

任务:{original_input}

📊 分析要求:
1. **详细分析过程** - 说明你是如何分析的,发现了什么
2. **具体结果** - 提供量化和定性的分析结果
3. **专业建议** - 基于分析结果给出可操作的建议
4. **下一步行动** - 明确指出接下来可以做什么

⚠️ 重要提醒:
- 回复必须超过150个字符
- 必须包含具体的分析内容
- 如果需要更多信息,请具体说明需要什么
- 绝对不能回复"No response requested"或任何简短拒绝"""

        # 添加上下文信息
        if context:
            context_section = "\n\n📋 上下文信息:\n"
            for key, value in context.items():
                context_section += f"- {key}: {json.dumps(value, ensure_ascii=False)}\n"
            enhancement_framework += context_section

        # 添加任务连续性
        enhancement_framework += f"""

🔄 任务连续性:
- 会话ID: {self.create_safe_session_id()}
- 时间戳: {time.strftime('%Y-%m-%d %H:%M:%S')}
- 任务状态: 进行中,需要你的分析来继续

请立即开始你的分析,不要等待或请求确认."""

        return enhancement_framework

    def create_robust_request_structure(self, user_input: str, context: Dict = None) -> ClaudeSafeRequest:
        """创建强健的请求结构"""

        # 增强用户输入
        enhanced_message = self.enhance_user_input_comprehensively(user_input, context)

        # 创建安全请求
        safe_request = ClaudeSafeRequest(
            user_message=enhanced_message,
            system_prompt=self.create_comprehensive_system_prompt(),
            context=context or {},
            session_id=self.create_safe_session_id(),
            force_response=True,
            min_response_length=150,
            max_tokens=4000
        )

        return safe_request

    def convert_to_api_format(self, safe_request: ClaudeSafeRequest) -> Dict[str, Any]:
        """转换为API调用格式"""

        api_request = {
            "model": "claude-3-sonnet-20240229",  # 或其他可用模型
            "messages": [
                {
                    "role": "system",
                    "content": safe_request.system_prompt
                },
                {
                    "role": "user",
                    "content": safe_request.user_message
                }
            ],
            "max_tokens": safe_request.max_tokens,
            "temperature": 0.7,
            "stream": False,
            # 强制响应参数
            "stop_sequences": [
                "No response requested",
                "I cannot provide",
                "I'm unable to",
                "As an AI assistant",
                "我是一个AI助手"
            ],
            # 元数据
            "metadata": {
                "session_id": safe_request.session_id,
                "force_response": safe_request.force_response,
                "min_response_length": safe_request.min_response_length,
                "request_timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
            }
        }

        # 添加上下文到用户消息中
        if safe_request.context:
            context_str = json.dumps(safe_request.context, ensure_ascii=False, indent=2)
            api_request["messages"][-1]["content"] += f"\n\n额外上下文:{context_str}"

        return api_request

    def validate_response_quality(self, response_content: str, expected_length: int = 150) -> Dict[str, Any]:
        """验证响应质量"""

        validation = {
            "is_valid": True,
            "quality_score": 0,
            "issues": [],
            "recommendations": [],
            "meets_requirements": False
        }

        # 长度检查
        if len(response_content) < expected_length:
            validation["issues"].append(f"响应长度不足:{len(response_content)} < {expected_length}")
            validation["is_valid"] = False
        else:
            validation["quality_score"] += 30

        # 禁止模式检查
        forbidden_patterns = [
            "no response requested",
            "i cannot provide",
            "i'm unable to",
            "作为ai助手",
            "我是一个ai助手"
        ]

        content_lower = response_content.lower()
        for pattern in forbidden_patterns:
            if pattern in content_lower:
                validation["issues"].append(f"包含禁止模式: {pattern}")
                validation["is_valid"] = False
                break
        else:
            validation["quality_score"] += 30

        # 内容质量检查
        quality_indicators = [
            "分析", "结果", "建议", "步骤", "发现", "结论",
            "首先", "其次", "最后", "总结", "因此"
        ]

        quality_count = sum(1 for indicator in quality_indicators if indicator in response_content)
        if quality_count >= 3:
            validation["quality_score"] += 25
        elif quality_count >= 1:
            validation["quality_score"] += 15

        # 结构检查
        if len(response_content.split('\n')) >= 4:
            validation["quality_score"] += 15

        # 最终判断
        validation["meets_requirements"] = (
            validation["is_valid"] and
            validation["quality_score"] >= 70
        )

        # 生成建议
        if not validation["meets_requirements"]:
            if validation["issues"]:
                validation["recommendations"].append("解决以下问题: " + "; ".join(validation["issues"]))
            if validation["quality_score"] < 50:
                validation["recommendations"].append("增加更多实质性内容和分析")
            if len(response_content.split('\n')) < 4:
                validation["recommendations"].append("改善响应结构,增加分段")

        return validation

    def create_fallback_strategy(self, original_request: ClaudeSafeRequest, failed_response: str = None) -> ClaudeSafeRequest:
        """创建回退策略"""

        # 增强系统提示,更加强制性
        enhanced_system = """之前的回复不够充分.现在你必须:

1. 提供超详细的分析内容
2. 确保回复超过300字
3. 包含具体的数字,例子和建议
4. 绝对不能说"无法提供"或任何拒绝

用户需要的是实际的分析结果,不是借口.立即开始详细分析!"""

        # 更直接的用户消息
        enhanced_user = f"""我需要你对以下内容进行极其详细的分析:

{original_request.user_message}

特别要求:
- 必须提供具体的分析和数据
- 必须给出明确的建议
- 必须说明下一步怎么做
- 回复必须超过300字

不要说"无法提供",直接基于现有信息给出最佳分析!"""

        fallback_request = ClaudeSafeRequest(
            user_message=enhanced_user,
            system_prompt=enhanced_system,
            context=original_request.context,
            session_id=self.create_safe_session_id(),
            force_response=True,
            min_response_length=300,  # 提高要求
            max_tokens=4000
        )

        return fallback_request

# 便捷函数
_final_fix = None

def get_final_claude_fix() -> FinalClaudeFix:
    """获取最终Claude修复器实例"""
    global _final_fix
    if _final_fix is None:
        _final_fix = FinalClaudeFix()
    return _final_fix

def create_claude_safe_request(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """创建安全的Claude API请求"""
    fixer = get_final_claude_fix()
    safe_request = fixer.create_robust_request_structure(user_input, context)
    api_request = fixer.convert_to_api_format(safe_request)
    return api_request

def enhance_user_input_final(user_input: str, context: Dict = None) -> str:
    """最终版本的用户输入增强"""
    fixer = get_final_claude_fix()
    return fixer.enhance_user_input_comprehensively(user_input, context)

def validate_claude_response(response: str) -> Dict[str, Any]:
    """验证Claude响应质量"""
    fixer = get_final_claude_fix()
    return fixer.validate_response_quality(response)

def create_fallback_request(original_user_input: str, context: Dict = None) -> Dict[str, Any]:
    """创建回退请求"""
    fixer = get_final_claude_fix()
    safe_request = fixer.create_robust_request_structure(original_user_input, context)
    fallback_request = fixer.create_fallback_strategy(safe_request)
    api_request = fixer.convert_to_api_format(fallback_request)
    return api_request

# 实际使用示例
def demonstrate_final_solution():
    """演示最终解决方案"""
    print("🎯 最终Claude Code修复方案演示")
    print("=" * 60)

    fixer = get_final_claude_fix()

    # 测试用例
    test_cases = [
        ("继续", {"task": "网站分析"}),
        ("", {}),
        ("分析example.com的Stripe使用情况", {"type": "technical_analysis"}),
        ("请提供建议", {"domain": "test.com"})
    ]

    for i, (user_input, context) in enumerate(test_cases, 1):
        print(f"\n📋 测试用例 {i}: '{user_input}'")

        # 创建安全请求
        api_request = create_claude_safe_request(user_input, context)

        print(f"✅ 会话ID: {api_request['metadata']['session_id']}")
        print(f"✅ 用户消息长度: {len(api_request['messages'][-1]['content'])} 字符")
        print(f"✅ 强制响应: {api_request['metadata']['force_response']}")
        print(f"✅ 最小长度要求: {api_request['metadata']['min_response_length']} 字符")

        # 模拟响应验证
        sample_response = "这是一个详细的分析响应,包含了对用户请求的全面分析和具体建议." * 5
        validation = validate_claude_response(sample_response)

        print(f"✅ 响应验证: {'通过' if validation['meets_requirements'] else '未通过'}")
        print(f"✅ 质量分数: {validation['quality_score']}/100")

    print(f"\n🎉 演示完成!")
    print(f"📊 核心改进:")
    print(f"   • 强制响应机制")
    print(f"   • 全面用户输入增强")
    print(f"   • 严格响应质量验证")
    print(f"   • 多层回退策略")
    print(f"   • 会话状态管理")

def main():
    """主函数"""
    demonstrate_final_solution()

if __name__ == "__main__":
    main
    )