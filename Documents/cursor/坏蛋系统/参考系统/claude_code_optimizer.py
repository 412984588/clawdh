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


Claude Code API交互优化器
解决"No response requested"问题的专用工具
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging

# 导入API错误处理器
from api_error_handler import (
    get_api_error_handler,
    handle_api_response,
    validate_and_fix_request,
    APIError,
    ErrorType,
    ValidationError
)

@dataclass
class APIRequest:
    """API请求结构"""
    user_message: str
    context: Dict[str, Any]
    tools: List[str]
    expected_response: str
    session_id: str

@dataclass
class APIResponse:
    """API响应结构"""
    content: str
    tool_calls: List[Dict]
    session_id: str
    timestamp: float

class ClaudeCodeOptimizer:
    """Claude Code API交互优化器

    专门解决"No response requested"问题
    确保每次API调用都有明确的用户请求内容
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.session_contexts = {}  # 存储会话上下文

    def create_structured_request(self, user_input: str, context: Dict = None) -> APIRequest:
        """创建结构化的API请求

        Args:
            user_input: 用户输入内容
            context: 额外上下文信息

        Returns:
            结构化的API请求对象
        """
        session_id = f"session_{int(time.time())}"

        # 确保有明确的用户请求内容
        if not user_input or user_input.strip() == "":
            user_input = "请继续执行当前任务或提供状态更新"

        # 构建完整的请求结构
        request = APIRequest(
            user_message=user_input,
            context=context or {},
            tools=[],
            expected_response="详细的分析结果或执行状态",
            session_id=session_id
        )

        # 存储会话上下文
        self.session_contexts[session_id] = {
            'created_at': time.time(),
            'last_activity': time.time(),
            'message_count': 1,
            'context': context
        }

        return request

    def format_api_call(self, request: APIRequest) -> Dict[str, Any]:
        """格式化API调用结构

        确保API调用包含所有必要字段,避免"No response requested"
        """
        api_payload = {
            # 明确的用户消息 - 这是最重要的
            "messages": [
                {
                    "role": "user",
                    "content": request.user_message
                }
            ],

            # 系统指令
            "system": """你是一个专业的网站分析助手.请始终提供详细的分析结果,不要回复"No response requested".

在完成任何操作后,请:
1. 提供清晰的结果总结
2. 说明下一步建议
3. 确认任务状态
            """,

            # 工具配置
            "tools": [
                {
                    "type": "function",
                    "function": {
                        "name": "analyze_website",
                        "description": "分析网站使用Stripe Connect的情况",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "domain": {"type": "string"},
                                "analysis_type": {"type": "string"}
                            }
                        }
                    }
                }
            ],

            # 会话配置
            "session_id": request.session_id,
            "context": request.context,

            # 响应配置 - 确保有明确的响应要求
            "response_format": {
                "type": "text",
                "require_content": True,  # 强制要求内容
                "min_length": 50  # 最小长度要求
            }
        }

        return api_payload

    def create_follow_up_request(self, session_id: str, new_input: str) -> Optional[APIRequest]:
        """创建后续请求

        基于现有会话创建连续的请求,避免上下文丢失
        """
        if session_id not in self.session_contexts:
            self.logger.warning(f"会话 {session_id} 不存在")
            return None

        # 更新会话活动
        self.session_contexts[session_id]['last_activity'] = time.time()
        self.session_contexts[session_id]['message_count'] += 1

        # 构建包含上下文的用户消息
        context = self.session_contexts[session_id]['context']
        contextual_message = f"""基于之前的分析进度,{new_input}

当前会话上下文:
- 会话ID: {session_id}
- 消息数量: {self.session_contexts[session_id]['message_count']}
- 上次活动: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(self.session_contexts[session_id]['last_activity']))}

请继续分析并提供详细结果.
        """

        return APIRequest(
            user_message=contextual_message,
            context=context,
            tools=[],
            expected_response="基于上下文的详细分析结果",
            session_id=session_id
        )

    def handle_no_response_scenario(self, session_id: str) -> APIRequest:
        """处理"No response requested"场景

        当遇到无响应时,创建恢复请求
        """
        recovery_message = f"""系统检测到之前的请求可能没有得到充分响应.请重新分析当前任务状态并提供详细反馈.

会话ID: {session_id}
当前时间: {time.strftime('%Y-%m-%d %H:%M:%S')}

请提供:
1. 当前任务执行状态
2. 已完成的工作总结
3. 下一步具体操作建议
4. 任何遇到的问题或需要的支持

请确保回复包含实质性内容,不要使用"No response requested".
        """

        return self.create_structured_request(
            recovery_message,
            {"recovery_mode": True, "original_session": session_id}
        )

    def validate_response(self, response_content: str) -> Dict[str, Any]:
        """验证响应内容

        检查是否为有效响应,过滤"No response requested"
        """
        validation_result = {
            "is_valid": True,
            "is_empty": False,
            "is_no_response": False,
            "needs_retry": False,
            "suggestions": []
        }

        # 检查内容是否为空或过短
        if not response_content or len(response_content.strip()) < 10:
            validation_result["is_empty"] = True
            validation_result["needs_retry"] = True
            validation_result["suggestions"].append("响应内容过短,需要重新请求")

        # 检查是否为"No response requested"
        if "no response requested" in response_content.lower():
            validation_result["is_no_response"] = True
            validation_result["needs_retry"] = True
            validation_result["suggestions"].append("检测到'No response requested',需要重新构建请求")

        # 综合判断
        if validation_result["is_empty"] or validation_result["is_no_response"]:
            validation_result["is_valid"] = False

        return validation_result

    def optimize_request_structure(self, original_request: str) -> str:
        """优化原始请求结构

        将可能模糊的请求转换为明确的指令
        """
        # 检查是否是模糊请求
        vague_patterns = [
            "继续",
            "go on",
            "next",
            "分析",
            "检查",
            "处理"
        ]

        request_lower = original_request.lower().strip()
        is_vague = any(pattern in request_lower for pattern in vague_patterns)

        if is_vague and len(original_request.strip()) < 20:
            # 转换为明确的请求
            optimized_request = f"""请详细执行以下任务:{original_request}

请提供:
1. 执行过程的具体步骤
2. 遇到的问题及解决方案
3. 最终结果和数据
4. 下一步建议

确保回复内容详细且具有操作性.
            """
            return optimized_request

        return original_request

    def cleanup_old_sessions(self, max_age_hours: int = 24):
        """清理旧会话"""
        current_time = time.time()
        expired_sessions = []

        for session_id, session_data in self.session_contexts.items():
            age = current_time - session_data['last_activity']
            if age > max_age_hours * 3600:
                expired_sessions.append(session_id)

        for session_id in expired_sessions:
            del self.session_contexts[session_id]
            self.logger.info(f"清理过期会话: {session_id}")

    def handle_422_error(self, api_error: APIError, original_request: APIRequest) -> Tuple[bool, Optional[APIRequest]]:
        """处理422 Unprocessable Entity错误

        Args:
            api_error: 解析后的API错误
            original_request: 原始请求

        Returns:
            (是否可以自动修复, 修复后的请求)
        """
        if api_error.error_type != ErrorType.VALIDATION_ERROR or api_error.status_code != 422:
            return False, None

        error_handler = get_api_error_handler()

        # 尝试自动修复请求数据
        request_data = {
            "user_message": original_request.user_message,
            "context": original_request.context,
            "tools": original_request.tools,
            "expected_response": original_request.expected_response
        }

        can_fix, fixed_data = asyncio.run(
            error_handler.auto_fix_request(request_data, api_error)
       
    )

        if can_fix:
            # 创建修复后的请求
            fixed_request = APIRequest(
                user_message=fixed_data.get("user_message", original_request.user_message),
                context=fixed_data.get("context", original_request.context),
                tools=fixed_data.get("tools", original_request.tools),
                expected_response=fixed_data.get("expected_response", original_request.expected_response),
                session_id=original_request.session_id
            )

            self.logger.info(f"成功修复422错误,会话ID: {original_request.session_id}")
            return True, fixed_request

        # 如果无法自动修复,生成详细错误信息和修复建议
        error_report = error_handler.generate_error_report(api_error, request_data)

        # 创建包含修复建议的新请求
        fix_suggestions = "\n".join(error_report["recommendations"])
        error_details = "\n".join([
            f"字段: {err['field']}, 错误: {err['message']}"
            for err in error_report["validation_errors"]
        ])

        recovery_message = f"""之前的请求遇到了422验证错误,需要修复后重新提交:

错误详情:
{error_details}

修复建议:
{fix_suggestions}

请根据以上建议修正请求数据,然后重新执行分析.

会话ID: {original_request.session_id}
时间: {time.strftime('%Y-%m-%d %H:%M:%S')}
            """

        recovery_request = self.create_structured_request(
            recovery_message,
            {
                "error_recovery": True,
                "original_error": "422_validation_error",
                "session_id": original_request.session_id,
                "error_details": error_report["validation_errors"]
            }
        )

        return True, recovery_request

    def validate_request_data(self, request: APIRequest, validation_rules: Dict = None) -> Tuple[bool, List[str]]:
        """验证请求数据,预防422错误

        Args:
            request: API请求
            validation_rules: 验证规则

        Returns:
            (是否有效, 错误消息列表)
        """
        if validation_rules is None:
            # 默认验证规则
            validation_rules = {
                "user_message": {
                    "required": True,
                    "string_length": {"min_length": 10, "max_length": 10000}
                },
                "session_id": {
                    "required": True,
                    "string_length": {"min_length": 5, "max_length": 100}
                }
            }

        request_data = {
            "user_message": request.user_message,
            "context": request.context,
            "session_id": request.session_id
        }

        validation_result = validate_and_fix_request(request_data, validation_rules)

        if validation_result["valid"]:
            return True, validation_result.get("warnings", [])
        else:
            error_messages = [f"{error.field}: {error.message}" for error in validation_result["errors"]]
            return False, error_messages

    def create_robust_api_call(self, request: APIRequest, max_retries: int = 3) -> Dict[str, Any]:
        """创建健壮的API调用,包含完整的错误处理

        Args:
            request: API请求
            max_retries: 最大重试次数

        Returns:
            包含结果或错误信息的字典
        """
        result = {
            "success": False,
            "request_id": request.session_id,
            "attempts": 0,
            "final_response": None,
            "errors": []
        }

        current_request = request
        error_handler = get_api_error_handler()

        for attempt in range(max_retries + 1):
            result["attempts"] = attempt + 1

            try:
                # 预验证请求数据
                is_valid, warnings = self.validate_request_data(current_request)
                if not is_valid:
                    raise ValueError(f"请求数据验证失败: {'; '.join(warnings)}")

                # 格式化API调用
                api_call = self.format_api_call(current_request)

                # 这里应该调用实际的API
                # 为了演示,我们模拟API响应
                simulated_response = self._simulate_api_call(api_call)

                if simulated_response["status_code"] >= 400:
                    # 处理API错误
                    error_result = handle_api_response(
                        simulated_response["data"],
                        simulated_response["status_code"],
                        api_call
                    )

                    if not error_result["success"]:
                        api_error = error_result["error"]
                        result["errors"].append({
                            "attempt": attempt + 1,
                            "error": api_error,
                            "message": f"API错误: {api_error.message}"
                        })

                        # 尝试处理422错误
                        if api_error.status_code == 422:
                            can_fix, fixed_request = self.handle_422_error(api_error, current_request)
                            if can_fix and fixed_request:
                                current_request = fixed_request
                                continue  # 使用修复后的请求重试

                        # 检查是否可以重试
                        if error_result.get("retry_request") and attempt < max_retries:
                            retry_delay = error_result["retry_request"].get("retry_after", 2 ** attempt)
                            self.logger.info(f"等待 {retry_delay} 秒后重试...")
                            time.sleep(retry_delay)
                            continue

                # 成功响应
                result["success"] = True
                result["final_response"] = simulated_response
                break

            except Exception as e:
                result["errors"].append({
                    "attempt": attempt + 1,
                    "error": str(e),
                    "message": f"请求异常: {str(e)}"
                })

                if attempt < max_retries:
                    self.logger.warning(f"请求失败,{2 ** attempt} 秒后重试: {e}")
                    time.sleep(2 ** attempt)

        return result

    def _simulate_api_call(self, api_call: Dict) -> Dict[str, Any]:
        """模拟API调用(用于演示)"""
        # 在实际应用中,这里会调用真实的API

        # 模拟一些可能的错误情况
        import random
        rand = random.random()

        if rand < 0.1:  # 10% 概率模拟422错误
            return {
                "status_code": 422,
                "data": {
                    "errors": {
                        "user_message": ["消息内容过短"],
                        "context": ["上下文格式无效"]
                    }
                }
            }
        elif rand < 0.2:  # 10% 概率模拟其他错误
            return {
                "status_code": 500,
                "data": {
                    "message": "内部服务器错误"
                }
            }
        else:  # 80% 概率成功
            return {
                "status_code": 200,
                "data": {
                    "content": "分析完成.根据您提供的数据,我发现了以下Stripe Connect使用情况...",
                    "session_id": api_call.get("session_id")
                }
            }

# 全局优化器实例
_claude_optimizer = None

def get_claude_optimizer() -> ClaudeCodeOptimizer:
    """获取Claude Code优化器实例"""
    global _claude_optimizer
    if _claude_optimizer is None:
        _claude_optimizer = ClaudeCodeOptimizer()
    return _claude_optimizer

def create_optimized_request(user_input: str, context: Dict = None) -> Dict[str, Any]:
    """创建优化的API请求

    这个函数可以直接在你的代码中使用
    """
    optimizer = get_claude_optimizer()

    # 优化请求内容
    optimized_input = optimizer.optimize_request_structure(user_input)

    # 创建结构化请求
    request = optimizer.create_structured_request(optimized_input, context)

    # 格式化为API调用格式
    api_call = optimizer.format_api_call(request)

    return api_call

def handle_claude_response(response_content: str, session_id: str) -> Dict[str, Any]:
    """处理Claude响应

    验证响应并在需要时提供恢复策略
    """
    optimizer = get_claude_optimizer()

    # 验证响应
    validation = optimizer.validate_response(response_content)

    if not validation["is_valid"]:
        # 创建恢复请求
        recovery_request = optimizer.handle_no_response_scenario(session_id)
        return {
            "status": "needs_retry",
            "validation": validation,
            "recovery_request": recovery_request,
            "suggestions": validation["suggestions"]
        }

    return {
        "status": "success",
        "validation": validation,
        "content": response_content
   
    )