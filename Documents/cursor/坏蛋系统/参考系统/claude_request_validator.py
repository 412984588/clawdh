#!/usr/bin/env python3
# Claude API请求验证器

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


# 自动修复messages.11.content等缺失问题


def validate_claude_request(request_data):
    """验证Claude API请求的完整性"""
    issues = []

    # 检查必需字段
    if "messages" not in request_data:
        issues.append("缺少messages字段")
        return issues

    messages = request_data["messages"]

    # 检查每条消息
    for i, message in enumerate(messages):
        if "content" not in message:
            issues.append(f"消息{i}: 缺少content字段")
        elif message["content"] is None:
            issues.append(f"消息{i}: content为null")
        elif message["content"] == "":
            issues.append(f"消息{i}: content为空字符串")
        elif isinstance(message["content"], list) and len(message["content"]) == 0:
            issues.append(f"消息{i}: content列表为空")

    return issues

def fix_claude_request(request_data):
    """自动修复Claude API请求"""
    # 导入修复器
    from messages_content_fix import ClaudeMessagesFixer

    fixer = ClaudeMessagesFixer()

    # 验证并修复消息
    result = fixer.validate_and_fix_messages(request_data["messages"])

    # 更新请求
    fixed_request = request_data.copy()
    fixed_request["messages"] = result["fixed_messages"]

    return fixed_request, result
