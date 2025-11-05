#!/usr/bin/env python3
"""
全面的API错误处理和数据验证模块
专门处理422 Unprocessable Entity和其他API错误
作者: Jenny团队
版本: 2.0.0 - 全面修复版
"""

import json
import re
import time
import logging
import uuid
from typing import Dict, List, Optional, Any, Union, Tuple, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio
from datetime import datetime, timedelta

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ErrorType(Enum):
    """错误类型枚举"""
    VALIDATION_ERROR = "validation_error"
    BUSINESS_RULE_ERROR = "business_rule_error"
    RESOURCE_CONFLICT = "resource_conflict"
    MISSING_DEPENDENCY = "missing_dependency"
    RATE_LIMIT_ERROR = "rate_limit_error"
    AUTHENTICATION_ERROR = "authentication_error"
    NETWORK_ERROR = "network_error"
    NO_RESPONSE_ERROR = "no_response_error"
    UNKNOWN_ERROR = "unknown_error"


@dataclass
class ValidationError:
    """验证错误详情"""
    field: str
    message: str
    value: Any = None
    constraint: Optional[str] = None
    error_code: Optional[str] = None
    severity: str = "error"  # error, warning, info


@dataclass
class APIError:
    """API错误信息"""
    status_code: int
    error_type: ErrorType
    message: str
    details: List[ValidationError]
    raw_response: Optional[Dict] = None
    timestamp: float = None
    retry_possible: bool = True
    retry_after: Optional[int] = None
    request_id: Optional[str] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
        if self.request_id is None:
            self.request_id = str(uuid.uuid4())


@dataclass
class ValidationResult:
    """验证结果"""
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[str] = None
    corrected_data: Optional[Dict] = None
    suggestions: List[str] = None

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []
        if self.suggestions is None:
            self.suggestions = []


@dataclass
class APIRequest:
    """API请求结构"""
    url: str
    method: str
    headers: Dict
    data: Dict
    max_tokens: int = 4000
    timeout: int = 30
    retry_count: int = 0
    max_retries: int = 3


class ComprehensiveAPIErrorHandler:
    """全面的API错误处理器
    专门处理422、No response requested和其他API错误,提供自动恢复机制
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_patterns = self._init_error_patterns()
        self.field_validators = self._init_field_validators()
        self.retry_strategies = self._init_retry_strategies()
        self.auto_fixers = self._init_auto_fixers()
        self.request_history = []

    def _init_error_patterns(self) -> Dict[str, Dict]:
        """初始化错误模式识别"""
        return {
            "validation_errors": {
                "patterns": [
                    r"validation failed",
                    r"invalid.*field",
                    r"missing.*required",
                    r"field.*required",
                    r"must be.*",
                    r"should be.*",
                    r"cannot be.*",
                    r"already exists",
                    r"duplicate.*",
                    r"unique.*constraint",
                    r"unprocessable entity",
                    r"422.*error"
                ],
                "status_codes": [400, 422, 409]
            },
            "no_response_errors": {
                "patterns": [
                    r"no response requested",
                    r"empty.*response",
                    r"response.*none",
                    r"停止响应",
                    r"no.*output"
                ],
                "status_codes": [200, 204, 400]
            },
            "business_rule_errors": {
                "patterns": [
                    r"business rule",
                    r"not allowed",
                    r"forbidden",
                    r"cannot.*when.*",
                    r"already.*",
                    r"status.*conflict"
                ],
                "status_codes": [422, 403, 409]
            },
            "rate_limit_errors": {
                "patterns": [
                    r"rate limit",
                    r"too many requests",
                    r"quota exceeded",
                    r"try again later"
                ],
                "status_codes": [429, 503]
            }
        }

    def _init_field_validators(self) -> Dict[str, Callable]:
        """初始化字段验证器"""
        return {
            "email": self._validate_email,
            "url": self._validate_url,
            "domain": self._validate_domain,
            "phone": self._validate_phone,
            "number": self._validate_number,
            "positive_number": self._validate_positive_number,
            "date": self._validate_date,
            "required": self._validate_required,
            "string_length": self._validate_string_length,
            "json": self._validate_json,
            "max_tokens": self._validate_max_tokens,
            "user_message": self._validate_user_message
        }

    def _init_retry_strategies(self) -> Dict[ErrorType, Dict]:
        """初始化重试策略"""
        return {
            ErrorType.VALIDATION_ERROR: {
                "max_retries": 3,
                "backoff_factor": 1.5,
                "auto_fix": True,
                "exponential_backoff": True
            },
            ErrorType.NO_RESPONSE_ERROR: {
                "max_retries": 5,
                "backoff_factor": 2.0,
                "auto_fix": True,
                "exponential_backoff": True
            },
            ErrorType.BUSINESS_RULE_ERROR: {
                "max_retries": 2,
                "backoff_factor": 2.0,
                "auto_fix": False,
                "exponential_backoff": False
            },
            ErrorType.RESOURCE_CONFLICT: {
                "max_retries": 5,
                "backoff_factor": 1.2,
                "auto_fix": False,
                "exponential_backoff": True
            },
            ErrorType.RATE_LIMIT_ERROR: {
                "max_retries": 10,
                "backoff_factor": 2.0,
                "auto_fix": True,
                "exponential_backoff": True
            },
            ErrorType.NETWORK_ERROR: {
                "max_retries": 5,
                "backoff_factor": 1.5,
                "auto_fix": True,
                "exponential_backoff": True
            }
        }

    def _init_auto_fixers(self) -> Dict[ErrorType, Callable]:
        """初始化自动修复器"""
        return {
            ErrorType.VALIDATION_ERROR: self._auto_fix_validation_error,
            ErrorType.NO_RESPONSE_ERROR: self._auto_fix_no_response_error,
            ErrorType.BUSINESS_RULE_ERROR: self._auto_fix_business_rule_error,
            ErrorType.RATE_LIMIT_ERROR: self._auto_fix_rate_limit_error
        }

    def parse_api_error(self, response_data: Dict, status_code: int) -> APIError:
        """解析API错误响应"""
        # 确定错误类型
        error_type = self._determine_error_type(response_data, status_code)

        # 提取错误消息
        message = self._extract_error_message(response_data)

        # 提取验证错误详情
        validation_errors = self._extract_validation_errors(response_data)

        # 检查是否可以重试
        retry_possible = self._can_retry(error_type, status_code)
        retry_after = self._extract_retry_after(response_data)

        return APIError(
            status_code=status_code,
            error_type=error_type,
            message=message,
            details=validation_errors,
            raw_response=response_data,
            retry_possible=retry_possible,
            retry_after=retry_after
        )

    def _determine_error_type(self, response_data: Dict, status_code: int) -> ErrorType:
        """确定错误类型"""
        message_text = json.dumps(response_data).lower()

        # 首先检查 No response requested 错误
        for pattern in self.error_patterns["no_response_errors"]["patterns"]:
            if re.search(pattern, message_text):
                return ErrorType.NO_RESPONSE_ERROR

        # 检查其他错误模式
        for error_name, error_info in self.error_patterns.items():
            if error_name == "no_response_errors":
                continue
            for pattern in error_info["patterns"]:
                if re.search(pattern, message_text):
                    if error_name == "validation_errors":
                        return ErrorType.VALIDATION_ERROR
                    elif error_name == "business_rule_errors":
                        return ErrorType.BUSINESS_RULE_ERROR
                    elif error_name == "rate_limit_errors":
                        return ErrorType.RATE_LIMIT_ERROR

        # 基于状态码判断
        if status_code == 422:
            return ErrorType.VALIDATION_ERROR
        elif status_code == 409:
            return ErrorType.RESOURCE_CONFLICT
        elif status_code == 429:
            return ErrorType.RATE_LIMIT_ERROR
        elif status_code in [401, 403]:
            return ErrorType.AUTHENTICATION_ERROR
        elif status_code >= 500:
            return ErrorType.NETWORK_ERROR

        return ErrorType.UNKNOWN_ERROR

    def _extract_error_message(self, response_data: Dict) -> str:
        """提取错误消息"""
        possible_keys = [
            "message", "error", "detail", "msg",
            "description", "title", "summary", "status"
        ]

        for key in possible_keys:
            if key in response_data:
                return str(response_data[key])

        # 检查errors结构
        if "errors" in response_data:
            errors = response_data["errors"]
            if isinstance(errors, dict):
                messages = []
                for field, error_list in errors.items():
                    if isinstance(error_list, list):
                        messages.extend([str(e) for e in error_list])
                    else:
                        messages.append(str(error_list))
                return "; ".join(messages)
            elif isinstance(errors, list):
                return "; ".join([str(e) for e in errors])

        # 检查details结构
        if "details" in response_data:
            details = response_data["details"]
            if isinstance(details, list):
                messages = []
                for detail in details:
                    if isinstance(detail, dict) and "message" in detail:
                        messages.append(detail["message"])
                    else:
                        messages.append(str(detail))
                return "; ".join(messages)

        return f"API请求失败,状态码:{response_data.get('status', 'unknown')}"

    def _extract_validation_errors(self, response_data: Dict) -> List[ValidationError]:
        """提取验证错误详情"""
        validation_errors = []

        # 从errors字段提取
        if "errors" in response_data:
            errors = response_data["errors"]
            if isinstance(errors, dict):
                for field, error_info in errors.items():
                    if isinstance(error_info, list):
                        for error_msg in error_info:
                            validation_errors.append(ValidationError(
                                field=field,
                                message=str(error_msg),
                                value=None
                            ))
                    else:
                        validation_errors.append(ValidationError(
                            field=field,
                            message=str(error_info),
                            value=None
                        ))

        # 从details字段提取
        if "details" in response_data:
            details = response_data["details"]
            if isinstance(details, list):
                for detail in details:
                    if isinstance(detail, dict):
                        field = detail.get("field", "unknown")
                        message = detail.get("message", str(detail))
                        value = detail.get("value")
                        constraint = detail.get("constraint")
                        error_code = detail.get("code")
                        validation_errors.append(ValidationError(
                            field=field,
                            message=message,
                            value=value,
                            constraint=constraint,
                            error_code=error_code
                        ))

        return validation_errors

    def _can_retry(self, error_type: ErrorType, status_code: int) -> bool:
        """判断是否可以重试"""
        # 某些错误类型总是可以重试
        if error_type in [
            ErrorType.RATE_LIMIT_ERROR,
            ErrorType.NETWORK_ERROR,
            ErrorType.NO_RESPONSE_ERROR
        ]:
            return True

        # 验证错误有时可以自动修复
        if error_type == ErrorType.VALIDATION_ERROR:
            return True

        # 服务器错误可以重试
        if status_code >= 500:
            return True

        return False

    def _extract_retry_after(self, response_data: Dict) -> Optional[int]:
        """提取重试延迟时间"""
        # 检查headers中的Retry-After
        if "headers" in response_data:
            headers = response_data["headers"]
            if "Retry-After" in headers:
                try:
                    return int(headers["Retry-After"])
                except (ValueError, TypeError):
                    pass

        # 检查response中的retry_after字段
        if "retry_after" in response_data:
            try:
                return int(response_data["retry_after"])
            except (ValueError, TypeError):
                pass

        return None

    def validate_request_data(self, data: Dict, validation_rules: Dict) -> ValidationResult:
        """验证请求数据"""
        errors = []
        warnings = []
        suggestions = []
        corrected_data = data.copy()

        for field, rules in validation_rules.items():
            if field not in data and "required" in rules and rules["required"]:
                errors.append(ValidationError(
                    field=field,
                    message="必填字段缺失",
                    value=None
                ))
                continue

            if field in data:
                value = data[field]

                # 执行各种验证规则
                for rule_name, rule_config in rules.items():
                    if rule_name in self.field_validators:
                        validation_result = self.field_validators[rule_name](
                            value, rule_config, field
                        )

                        if isinstance(validation_result, ValidationError):
                            errors.append(validation_result)
                        elif isinstance(validation_result, tuple):
                            is_valid, corrected_value = validation_result
                            if not is_valid:
                                errors.append(ValidationError(
                                    field=field,
                                    message=f"字段{rule_name}验证失败",
                                    value=value
                                ))
                            elif corrected_value is not None:
                                corrected_data[field] = corrected_value
                        elif isinstance(validation_result, str):
                            if "error" in validation_result.lower():
                                errors.append(ValidationError(
                                    field=field,
                                    message=validation_result,
                                    value=value
                                ))
                            else:
                                warnings.append(f"{field}: {validation_result}")

        # 生成修复建议
        if errors:
            suggestions.extend(self._generate_fix_suggestions(errors))

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            corrected_data=corrected_data if len(errors) == 0 else None,
            suggestions=suggestions
        )

    def _generate_fix_suggestions(self, errors: List[ValidationError]) -> List[str]:
        """生成修复建议"""
        suggestions = []

        for error in errors:
            if error.field == "max_tokens":
                suggestions.append("添加max_tokens参数,建议值4000")
            elif "missing" in error.message.lower() and "required" in error.message.lower():
                suggestions.append(f"添加必填字段: {error.field}")
            elif "already exists" in error.message.lower():
                suggestions.append(f"字段{error.field}值重复,请使用唯一值")
            elif "negative" in error.message.lower():
                suggestions.append(f"字段{error.field}不能为负数")
            elif "invalid" in error.message.lower():
                suggestions.append(f"检查字段{error.field}的格式是否正确")

        return list(set(suggestions))  # 去重

    # 验证器方法
    def _validate_email(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证邮箱格式"""
        if not isinstance(value, str):
            return ValidationError(field, "邮箱必须是字符串", value)

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            return ValidationError(field, "邮箱格式无效", value)

        return True

    def _validate_url(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证URL格式"""
        if not isinstance(value, str):
            return ValidationError(field, "URL必须是字符串", value)

        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(url_pattern, value):
            return ValidationError(field, "URL格式无效", value)

        return True

    def _validate_domain(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证域名格式"""
        if not isinstance(value, str):
            return ValidationError(field, "域名必须是字符串", value)

        domain_pattern = r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(domain_pattern, value):
            return ValidationError(field, "域名格式无效", value)

        return True

    def _validate_phone(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证手机号格式"""
        if not isinstance(value, str):
            return ValidationError(field, "手机号必须是字符串", value)

        phone_pattern = r'^1[3-9]\d{9}$'
        if not re.match(phone_pattern, value):
            return ValidationError(field, "手机号格式无效", value)

        return True

    def _validate_number(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证数字格式"""
        if not isinstance(value, (int, float)):
            return ValidationError(field, "必须是数字", value)

        min_val = config.get("min")
        max_val = config.get("max")

        if min_val is not None and value < min_val:
            return ValidationError(field, f"数值不能小于{min_val}", value)

        if max_val is not None and value > max_val:
            return ValidationError(field, f"数值不能大于{max_val}", value)

        return True

    def _validate_positive_number(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证正数"""
        if not isinstance(value, (int, float)) or value <= 0:
            return ValidationError(field, "必须是正数", value)

        return True

    def _validate_date(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证日期格式"""
        if not isinstance(value, str):
            return ValidationError(field, "日期必须是字符串", value)

        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            return ValidationError(field, "日期格式无效,应为YYYY-MM-DD", value)

        return True

    def _validate_required(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证必填字段"""
        if value is None or (isinstance(value, str) and not value.strip()):
            return ValidationError(field, "必填字段不能为空", value)

        return True

    def _validate_string_length(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证字符串长度"""
        if not isinstance(value, str):
            return ValidationError(field, "必须是字符串", value)

        min_length = config.get("min_length", 0)
        max_length = config.get("max_length", float('inf'))

        if len(value) < min_length:
            return ValidationError(field, f"长度不能少于{min_length}个字符", value)

        if len(value) > max_length:
            return ValidationError(field, f"长度不能超过{max_length}个字符", value)

        return True

    def _validate_json(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证JSON格式"""
        if isinstance(value, str):
            try:
                json.loads(value)
            except json.JSONDecodeError:
                return ValidationError(field, "JSON格式无效", value)
        elif isinstance(value, dict):
            return True
        else:
            return ValidationError(field, "必须是JSON字符串或字典", value)

        return True

    def _validate_max_tokens(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证max_tokens参数"""
        if not isinstance(value, int) or value <= 0:
            return ValidationError(field, "max_tokens必须是正整数", value)

        if value < 100:
            return ValidationError(field, "max_tokens建议不小于100", value)

        if value > 100000:
            return ValidationError(field, "max_tokens不建议超过100000", value)

        return True

    def _validate_user_message(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证用户消息"""
        if not isinstance(value, str):
            return ValidationError(field, "用户消息必须是字符串", value)

        if len(value.strip()) < 3:
            return ValidationError(field, "用户消息内容过短", value)

        if len(value) > 50000:
            return ValidationError(field, "用户消息过长,建议控制在50000字符以内", value)

        return True

    # 自动修复方法
    def _auto_fix_validation_error(self, request: APIRequest, error: APIError) -> Tuple[APIRequest, List[str]]:
        """自动修复验证错误"""
        fixed_request = request
        fixes_applied = []

        data = request.data.copy()

        # 修复缺失的max_tokens
        if "max_tokens" not in data:
            data["max_tokens"] = 4000
            fixes_applied.append("添加max_tokens: 4000")

        # 修复缺失的user_message
        if "messages" in data and len(data["messages"]) > 0:
            if not data["messages"][0].get("content"):
                data["messages"][0]["content"] = "请继续执行当前任务并提供详细结果"
                fixes_applied.append("添加默认用户消息")

        # 修复字符串中的中文标点
        for key, value in data.items():
            if isinstance(value, str):
                fixed_value = self._fix_chinese_punctuation(value)
                if fixed_value != value:
                    data[key] = fixed_value
                    fixes_applied.append(f"修复字段{key}中的中文标点")

        fixed_request.data = data
        return fixed_request, fixes_applied

    def _auto_fix_no_response_error(self, request: APIRequest, error: APIError) -> Tuple[APIRequest, List[str]]:
        """自动修复No response requested错误"""
        fixed_request = request
        fixes_applied = []

        data = request.data.copy()

        # 确保有max_tokens
        if "max_tokens" not in data:
            data["max_tokens"] = 4000
            fixes_applied.append("添加max_tokens: 4000")

        # 增强用户消息
        if "messages" in data and len(data["messages"]) > 0:
            current_content = data["messages"][0].get("content", "")
            if len(current_content.strip()) < 20:
                enhanced_content = f"""请详细分析和处理以下任务:

{current_content if current_content else "继续当前的分析工作"}

具体要求:
1. 提供详细的分析过程和结果
2. 列出发现的关键信息
3. 给出具体的建议和结论
4. 说明下一步可以采取的行动
5. 如果需要更多信息,请明确指出

请确保回复内容详细且有价值,避免简短或模糊的回复."""

                data["messages"][0]["content"] = enhanced_content
                fixes_applied.append("增强用户消息内容")

        # 添加停止序列
        if "stop_sequences" not in data:
            data["stop_sequences"] = ["No response requested", "I cannot provide", "I'm unable to"]
            fixes_applied.append("添加停止序列")

        fixed_request.data = data
        return fixed_request, fixes_applied

    def _auto_fix_business_rule_error(self, request: APIRequest, error: APIError) -> Tuple[APIRequest, List[str]]:
        """自动修复业务规则错误"""
        # 业务规则错误通常需要用户干预,这里只做基本修复
        return request, ["业务规则错误需要手动处理"]

    def _auto_fix_rate_limit_error(self, request: APIRequest, error: APIError) -> Tuple[APIRequest, List[str]]:
        """自动修复速率限制错误"""
        fixed_request = request
        fixes_applied = []

        # 增加重试延迟
        if error.retry_after:
            fixed_request.retry_count = error.retry_after
            fixes_applied.append(f"应用建议重试延迟: {error.retry_after}秒")

        return fixed_request, fixes_applied

    def _fix_chinese_punctuation(self, text: str) -> str:
        """修复中文标点符号"""
        punctuation_map = {
            ',': ',',
            '.': '.',
            ':': ':',
            ';': ';',
            '!': '!',
            '?': '?',
            '、': ',',
            '"': '"',
            '"': '"',
 ''': "'",
 ''': "'",
            '(': '(',
            ')': ')'
        }

        for chinese, english in punctuation_map.items():
            text = text.replace(chinese, english)

        return text

    async def execute_with_fallback(self, request: APIRequest, api_call_func: Callable) -> Dict[str, Any]:
        """带回退机制的API执行"""
        results = {
            "success": False,
            "response": None,
            "attempts": 0,
            "errors": [],
            "fixes_applied": [],
            "request_id": str(uuid.uuid4())
        }

        max_attempts = request.max_retries + 1

        for attempt in range(max_attempts):
            results["attempts"] = attempt + 1

            try:
                # 记录请求历史
                self.request_history.append({
                    "request_id": results["request_id"],
                    "timestamp": time.time(),
                    "attempt": attempt + 1,
                    "request_data": request.data
                })

                # 执行API调用
                response = await api_call_func(request)

                # 检查响应是否成功
                if self._is_successful_response(response):
                    results["success"] = True
                    results["response"] = response
                    self.logger.info(f"API调用成功,尝试次数: {attempt + 1}")
                    break

                # 解析错误
                api_error = self.parse_api_error(response, response.get("status_code", 500))
                results["errors"].append(api_error)

                # 如果不能重试,直接返回
                if not api_error.retry_possible:
                    self.logger.warning(f"API错误不可重试: {api_error.message}")
                    break

                # 尝试自动修复
                if attempt < max_attempts - 1:
                    auto_fixer = self.auto_fixers.get(api_error.error_type)
                    if auto_fixer:
                        fixed_request, fixes = auto_fixer(request, api_error)
                        request = fixed_request
                        results["fixes_applied"].extend(fixes)

                        self.logger.info(f"应用自动修复: {fixes}")

                        # 等待重试
                        retry_delay = self._calculate_retry_delay(api_error, attempt)
                        if retry_delay > 0:
                            await asyncio.sleep(retry_delay)

            except Exception as e:
                error_info = {
                    "error_type": ErrorType.UNKNOWN_ERROR,
                    "message": str(e),
                    "timestamp": time.time()
                }
                results["errors"].append(error_info)
                self.logger.error(f"API调用异常: {e}")

                if attempt < max_attempts - 1:
                    await asyncio.sleep(2 ** attempt)  # 指数退避

        return results

    def _is_successful_response(self, response: Dict) -> bool:
        """判断响应是否成功"""
        if not isinstance(response, dict):
            return False

        # 检查状态码
        status_code = response.get("status_code", response.get("status", 200))
        if 200 <= status_code < 300:
            # 检查是否有No response requested
            response_text = json.dumps(response).lower()
            if "no response requested" in response_text:
                return False
            return True

        return False

    def _calculate_retry_delay(self, error: APIError, attempt: int) -> float:
        """计算重试延迟"""
        # 如果有建议的重试时间,优先使用
        if error.retry_after:
            return error.retry_after

        # 根据错误类型和策略计算
        strategy = self.retry_strategies.get(error.error_type, {})
        base_delay = strategy.get("backoff_factor", 1.5)

        if strategy.get("exponential_backoff", True):
            return base_delay ** attempt
        else:
            return base_delay

    def get_validation_rules_for_claude_api(self) -> Dict[str, Dict]:
        """获取Claude API的标准验证规则"""
        return {
            "max_tokens": {
                "required": True,
                "type": "int",
                "min": 1,
                "max": 100000
            },
            "messages": {
                "required": True,
                "type": "list",
                "min_length": 1
            },
            "model": {
                "required": False,
                "type": "string"
            },
            "temperature": {
                "required": False,
                "type": "float",
                "min": 0.0,
                "max": 1.0
            },
            "stop_sequences": {
                "required": False,
                "type": "list"
            }
        }


# 全局实例
_error_handler = None

def get_comprehensive_error_handler() -> ComprehensiveAPIErrorHandler:
    """获取全局错误处理器实例"""
    global _error_handler
    if _error_handler is None:
        _error_handler = ComprehensiveAPIErrorHandler()
    return _error_handler

# 便捷函数
async def safe_api_call(request: APIRequest, api_func: Callable) -> Dict[str, Any]:
    """安全的API调用函数"""
    handler = get_comprehensive_error_handler()
    return await handler.execute_with_fallback(request, api_func)

def validate_claude_request(data: Dict) -> ValidationResult:
    """验证Claude API请求"""
    handler = get_comprehensive_error_handler()
    rules = handler.get_validation_rules_for_claude_api()
    return handler.validate_request_data(data, rules)

def create_safe_claude_request(user_message: str, **kwargs) -> APIRequest:
    """创建安全的Claude请求"""
    # 默认参数
    default_data = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4000,
        "messages": [
            {
                "role": "user",
                "content": user_message if len(user_message.strip()) >= 3 else "请详细执行当前任务并提供结果"
            }
        ],
        "temperature": 0.7
    }

    # 合并用户参数
    default_data.update(kwargs)

    # 验证请求
    validation_result = validate_claude_request(default_data)
    if not validation_result.is_valid:
        raise ValueError(f"请求验证失败: {[e.message for e in validation_result.errors]}")

    return APIRequest(
        url="https://api.anthropic.com/v1/messages",
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": kwargs.get("api_key", ""),
            "anthropic-version": "2023-06-01"
        },
        data=default_data
    )


if __name__ == "__main__":
    # 测试代码
    async def test_error_handler():
        """测试错误处理器"""
        print("测试全面的API错误处理器...")

        handler = get_comprehensive_error_handler()

        # 测试数据验证
        test_data = {
            "messages": [{"role": "user", "content": "测试消息"}],
            "max_tokens": 4000
        }

        validation_result = validate_claude_request(test_data)
        print(f"验证结果: {validation_result.is_valid}")
        if validation_result.warnings:
            print(f"警告: {validation_result.warnings}")

        # 测试错误解析
        error_response = {
            "status_code": 422,
            "errors": {
                "max_tokens": ["This field is required."],
                "messages": ["Messages cannot be empty."]
            }
        }

        api_error = handler.parse_api_error(error_response, 422)
        print(f"解析的错误: {api_error.error_type}")
        print(f"错误消息: {api_error.message}")
        print(f"详细信息: {[e.message for e in api_error.details]}")

        print("✅ 全面API错误处理器测试完成")

    # 运行测试
    asyncio.run(test_error_handler())