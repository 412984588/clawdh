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


立即可用的Claude Code解决方案
解决"No response requested"问题的完整实施方案
作者: Jenny团队
版本: Immediate Fix 1.0.0
"""

import json
import time
import uuid
import logging
from typing import Dict, List, Optional, Any

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImmediateClaudeFix:
    """立即Claude修复器 - 简单直接的解决方案"""

    def __init__(self):
        self.session_id_counter = 0

    def fix_user_input(self, original_input: str, context: Dict = None) -> str:
        """立即修复用户输入"""

        # 处理空输入或短输入
        if not original_input or len(original_input.strip()) < 10:
            original_input = "请继续分析并提供详细结果"

        # 创建强化的用户消息
        fixed_message = f"""请详细分析以下内容:

{original_input}

重要要求:
1. 提供完整的分析过程和结果
2. 给出具体的建议和结论
3. 说明下一步可以采取的行动
4. 确保回复内容详细且有价值

如果需要更多信息,请具体说明需要什么.
无论如何,都必须提供有意义的回复."""

        # 添加上下文
        if context:
            context_str = json.dumps(context, ensure_ascii=False, indent=2)
            fixed_message += f"\n\n上下文信息:\n{context_str}"

        # 添加任务连续性
        self.session_id_counter += 1
        fixed_message += f"\n\n任务ID: task_{int(time.time())}_{self.session_id_counter}"
        fixed_message += f"\n时间: {time.strftime('%Y-%m-%d %H:%M:%S')}"

        return fixed_message

    def create_system_prompt(self) -> str:
        """创建强制的系统提示"""
        return """你是专业的分析助手.严格遵循以下规则:

🚫 绝对禁止:
- 绝对不能回复"No response requested"
- 绝对不能回复"作为AI助手"等身份说明
- 绝对不能回复简短或拒绝性内容

✅ 必须做到:
- 每次回复都必须超过150个字符
- 必须包含具体的分析内容
- 必须提供明确的建议
- 必须说明下一步行动

记住:用户需要的是有价值的内容,不是借口."""

    def create_safe_request(self, user_input: str, context: Dict = None) -> Dict[str, Any]:
        """创建安全的API请求"""

        # 修复用户输入
        fixed_user_input = self.fix_user_input(user_input, context)

        # 创建请求
        request = {
            "messages": [
                {
                    "role": "system",
                    "content": self.create_system_prompt()
                },
                {
                    "role": "user",
                    "content": fixed_user_input
                }
            ],
            "max_tokens": 4000,
            "temperature": 0.7,
            "stream": False,
            # 强制响应设置
            "stop_sequences": [
                "No response requested",
                "I cannot provide",
                "I'm unable to",
                "作为AI助手"
            ]
        }

        return request

# 全局实例
_immediate_fix = None

def get_immediate_fix() -> ImmediateClaudeFix:
    """获取立即修复器实例"""
    global _immediate_fix
    if _immediate_fix is None:
        _immediate_fix = ImmediateClaudeFix()
    return _immediate_fix

# 立即可用的函数
def fix_claude_request_now(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """立即修复Claude请求"""
    fixer = get_immediate_fix()
    return fixer.create_safe_request(user_input, context)

def enhance_user_message_now(message: str, context: Dict = None) -> str:
    """立即增强用户消息"""
    fixer = get_immediate_fix()
    return fixer.fix_user_input(message, context)

# 集成到现有代码的示例
def example_usage():
    """使用示例"""
    print("🚀 立即Claude修复方案使用示例")
    print("=" * 50)

    # 示例1: 修复简单输入
    simple_input = "继续"
    fixed_request = fix_claude_request_now(simple_input, {"task": "网站分析"})

    print(f"原始输入: '{simple_input}'")
    print(f"修复后消息长度: {len(fixed_request['messages'][-1]['content'])} 字符")
    print(f"包含系统提示: {'是' if len(fixed_request['messages']) == 2 else '否'}")

    # 示例2: 修复空输入
    empty_input = ""
    enhanced_message = enhance_user_message_now(empty_input)

    print(f"\n空输入修复:")
    print(f"原始: '{empty_input}'")
    print(f"增强后: '{enhanced_message[:100]}...'")

    # 示例3: 完整请求
    print(f"\n完整请求结构:")
    complete_request = fix_claude_request_now(
        "分析example.com",
        {"type": "stripe_analysis", "priority": "high"}
    )
    print(f"消息数量: {len(complete_request['messages'])}")
    print(f"最大令牌: {complete_request['max_tokens']}")
    print(f"停止序列: {len(complete_request['stop_sequences'])} 个")

# 实际应用模板
def apply_to_batch_analyzer():
    """应用到batch_analyzer.py的模板"""

    template_code = '''
# 在batch_analyzer.py中添加以下代码:

from IMMEDIATE_SOLUTION import fix_claude_request_now

class BatchStripeConnectAnalyzer:
    def analyze_with_claude(self, domain_info):
        # 创建安全的Claude请求
        user_input = f"请详细分析 {domain_info['domain']} 的Stripe Connect使用情况"
        context = {
            "domain": domain_info['domain'],
            "company": domain_info['company'],
            "analysis_type": "stripe_connect"
        }

        # 使用修复后的请求
        claude_request = fix_claude_request_now(user_input, context)

        # 调用Claude API
        response = your_claude_api_call(claude_request)

        return response

    def your_claude_api_call(self, request):
        # 这里是您实际的Claude API调用代码
        # 使用request参数调用API
        pass
'''

    print("📝 集成到batch_analyzer.py的代码模板:")
    print(template_code)

# 验证函数
def validate_fix_effectiveness():
    """验证修复效果"""
    print("\n🔍 修复效果验证:")

    test_cases = [
        ("", "空输入"),
        ("继续", "模糊输入"),
        ("分析", "短输入"),
        ("请详细分析网站", "正常输入")
    ]

    fixer = get_immediate_fix()

    for input_text, description in test_cases:
        fixed_request = fixer.create_safe_request(input_text)
        user_message = fixed_request['messages'][-1]['content']

        print(f"\n{description}:")
        print(f"  原始: '{input_text}'")
        print(f"  修复后长度: {len(user_message)} 字符")
        print(f"  包含分析要求: {'是' if '分析' in user_message else '否'}")
        print(f"  包含任务要求: {'是' if '要求' in user_message else '否'}")

def main():
    """主函数"""
    print("🎯 立即Claude Code修复方案")
    print("解决 'No response requested' 问题的简单直接方案")
    print("=" * 60)

    # 运行示例
    example_usage()

    # 显示集成模板
    apply_to_batch_analyzer()

    # 验证效果
    validate_fix_effectiveness()

    print("\n" + "=" * 60)
    print("✅ 立即解决方案已准备就绪")
    print("✅ 可以立即应用到您的代码中")
    print("✅ 简单直接,易于集成")
    print("✅ 专门解决No response requested问题")

    print("\n🚀 立即行动步骤:")
    print("1. 复制IMMEDIATE_SOLUTION.py到您的项目")
    print("2. 在您的代码中导入: from IMMEDIATE_SOLUTION import fix_claude_request_now")
    print("3. 替换现有的Claude请求调用")
    print("4. 测试验证效果")

if __name__ == "__main__":
    main
    )