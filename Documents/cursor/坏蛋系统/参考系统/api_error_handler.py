#!/usr/bin/env python3
"""
API错误处理和数据验证模块
专门处理422 Unprocessable Entity和其他API错误
作者: Jenny团队
版本: 1.0.0
"""

import json
import re
import time
import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio

class ErrorType(Enum):
    """错误类型枚举"""
    VALIDATION_ERROR = "validation_error"
    BUSINESS_RULE_ERROR = "business_rule_error"
    RESOURCE_CONFLICT = "resource_conflict"
    MISSING_DEPENDENCY = "missing_dependency"
    RATE_LIMIT_ERROR = "rate_limit_error"
    AUTHENTICATION_ERROR = "authentication_error"
    NETWORK_ERROR = "network_error"
    UNKNOWN_ERROR = "unknown_error"

@dataclass
class ValidationError:
    """验证错误详情"""
    field: str
    message: str
    value: Any
    constraint: Optional[str] = None
    error_code: Optional[str] = None

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

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

@dataclass
class ValidationResult:
    """验证结果"""
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[str] = None
    corrected_data: Optional[Dict] = None

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []

class APIErrorHandler:
    """API错误处理器

    专门处理422和其他API错误,提供自动恢复机制
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_patterns = self._init_error_patterns()
        self.field_validators = self._init_field_validators()
        self.retry_strategies = self._init_retry_strategies()

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
                    r"unique.*constraint"
                ],
                "status_codes": [400, 422, 409]
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

    def _init_field_validators(self) -> Dict[str, callable]:
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
            "json": self._validate_json
        }

    def _init_retry_strategies(self) -> Dict[ErrorType, Dict]:
        """初始化重试策略"""
        return {
            ErrorType.VALIDATION_ERROR: {
                "max_retries": 3,
                "backoff_factor": 1.5,
                "auto_fix": True
            },
            ErrorType.BUSINESS_RULE_ERROR: {
                "max_retries": 2,
                "backoff_factor": 2.0,
                "auto_fix": False
            },
            ErrorType.RESOURCE_CONFLICT: {
                "max_retries": 5,
                "backoff_factor": 1.2,
                "auto_fix": False
            },
            ErrorType.RATE_LIMIT_ERROR: {
                "max_retries": 10,
                "backoff_factor": 2.0,
                "auto_fix": True
            },
            ErrorType.NETWORK_ERROR: {
                "max_retries": 5,
                "backoff_factor": 1.5,
                "auto_fix": True
            }
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

        # 检查各种错误模式
        for error_name, error_info in self.error_patterns.items():
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
        # 尝试从不同位置提取错误消息
        possible_keys = [
            "message", "error", "detail", "msg", "description",
            "title", "summary", "status"
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

        # 默认消息
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
        if error_type in [ErrorType.RATE_LIMIT_ERROR, ErrorType.NETWORK_ERROR]:
            return True

        # 验证错误有时可以自动修复
        if error_type == ErrorType.VALIDATION_ERROR:
            return True

        # 业务规则错误通常不建议重试
        if error_type == ErrorType.BUSINESS_RULE_ERROR:
            return False

        # 认证错误不建议重试
        if error_type == ErrorType.AUTHENTICATION_ERROR:
            return False

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
                            warnings.append(f"{field}: {validation_result}")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            corrected_data=corrected_data if len(errors) == 0 else None
        )

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
        """验证电话号码格式"""
        if not isinstance(value, str):
            return ValidationError(field, "电话号码必须是字符串", value)

        phone_pattern = r'^[\d\s\-\+\(\)]{10,}$'
        if not re.match(phone_pattern, value):
            return ValidationError(field, "电话号码格式无效", value)

        return True

    def _validate_number(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证数字"""
        try:
            num_value = float(value)

            # 检查范围
            if "min" in config and num_value < config["min"]:
                return ValidationError(field, f"数值不能小于{config['min']}", value)

            if "max" in config and num_value > config["max"]:
                return ValidationError(field, f"数值不能大于{config['max']}", value)

            return True
        except (ValueError, TypeError):
            return ValidationError(field, "必须是有效数字", value)

    def _validate_positive_number(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证正数"""
        try:
            num_value = float(value)
            if num_value <= 0:
                return ValidationError(field, "必须是正数", value)
            return True
        except (ValueError, TypeError):
            return ValidationError(field, "必须是有效数字", value)

    def _validate_date(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证日期格式"""
        if not isinstance(value, str):
            return ValidationError(field, "日期必须是字符串", value)

        # 简单的ISO日期格式验证
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        if not re.match(date_pattern, value):
            return ValidationError(field, "日期格式应为YYYY-MM-DD", value)

        return True

    def _validate_required(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证必填字段"""
        if value is None or (isinstance(value, str) and not value.strip()):
            return ValidationError(field, "必填字段不能为空", value)
        return True

    def _validate_string_length(self, value: Any, config: Dict, field: str) -> Union[bool, Tuple[bool, Any]]:
        """验证字符串长度"""
        if not isinstance(value, str):
            return ValidationError(field, "必须是字符串", value)

        length = len(value)

        if "min_length" in config and length < config["min_length"]:
            return ValidationError(field, f"长度不能少于{config['min_length']}个字符", value)

        if "max_length" in config and length > config["max_length"]:
            # 如果长度超限,尝试截断
            if config.get("allow_truncate", False):
                return True, value[:config["max_length"]]
            else:
                return ValidationError(field, f"长度不能超过{config['max_length']}个字符", value)

        return True

    def _validate_json(self, value: Any, config: Dict, field: str) -> Union[bool, ValidationError]:
        """验证JSON格式"""
        if isinstance(value, str):
            try:
                json.loads(value)
                return True
            except json.JSONDecodeError:
                return ValidationError(field, "JSON格式无效", value)
        elif isinstance(value, (dict, list)):
            try:
                json.dumps(value)
                return True
            except (TypeError, ValueError):
                return ValidationError(field, "无法序列化为JSON", value)
        else:
            return ValidationError(field, "必须是字符串或JSON对象", value)

    async def auto_fix_request(self, original_data: Dict, api_error: APIError) -> Tuple[bool, Dict]:
        """自动修复请求数据"""
        if api_error.error_type != ErrorType.VALIDATION_ERROR:
            return False, original_data

        fixed_data = original_data.copy()
        fixes_applied = []

        for validation_error in api_error.details:
            field = validation_error.field
            message = validation_error.message.lower()
            value = validation_error.value

            # 根据错误消息应用修复策略
            if "required" in message and field in fixed_data and not fixed_data[field]:
                # 移除空的可选字段
                del fixed_data[field]
                fixes_applied.append(f"移除空的必填字段: {field}")

            elif "duplicate" in message or "already exists" in message:
                # 处理重复字段,可能需要生成唯一值
                if field in fixed_data:
                    fixed_data[field] = f"{fixed_data[field]}_{int(time.time())}"
                    fixes_applied.append(f"为重复字段生成唯一值: {field}")

            elif "invalid format" in message or "invalid" in message:
                # 格式错误,尝试基本修复
                if field == "email" and isinstance(value, str) and "@" not in value:
                    fixed_data[field] = f"{value}@example.com"
                    fixes_applied.append(f"修复邮箱格式: {field}")

            elif "too long" in message or "maximum" in message:
                # 字符串太长,尝试截断
                if isinstance(value, str) and len(value) > 100:
                    fixed_data[field] = value[:100]
                    fixes_applied.append(f"截断过长的字段: {field}")

        if fixes_applied:
            self.logger.info(f"自动修复请求数据: {'; '.join(fixes_applied)}")
            return True, fixed_data

        return False, original_data

    def create_retry_request(self, original_request: Dict, api_error: APIError, attempt: int = 1) -> Optional[Dict]:
        """创建重试请求"""
        if not api_error.retry_possible:
            return None

        # 获取重试策略
        strategy = self.retry_strategies.get(api_error.error_type, {
            "max_retries": 3,
            "backoff_factor": 2.0,
            "auto_fix": False
        })

        if attempt > strategy["max_retries"]:
            return None

        # 计算延迟时间
        if api_error.retry_after:
            delay = api_error.retry_after
        else:
            delay = min(strategy["backoff_factor"] ** attempt, 60)  # 最大60秒

        # 创建重试请求
        retry_request = original_request.copy()
        retry_request["retry_attempt"] = attempt
        retry_request["retry_after"] = delay
        retry_request["max_retries"] = strategy["max_retries"]

        # 添加错误上下文
        if "context" not in retry_request:
            retry_request["context"] = {}

        retry_request["context"]["error_recovery"] = {
            "original_error": asdict(api_error),
            "attempt": attempt,
            "auto_fix_enabled": strategy.get("auto_fix", False)
        }

        return retry_request

    def generate_error_report(self, api_error: APIError, request_data: Dict = None) -> Dict:
        """生成错误报告"""
        report = {
            "error_summary": {
                "status_code": api_error.status_code,
                "error_type": api_error.error_type.value,
                "message": api_error.message,
                "timestamp": api_error.timestamp,
                "retry_possible": api_error.retry_possible
            },
            "validation_errors": [asdict(error) for error in api_error.details],
            "request_analysis": {},
            "recommendations": []
        }

        if request_data:
            report["request_analysis"] = {
                "request_size": len(json.dumps(request_data)),
                "fields_count": len(request_data) if isinstance(request_data, dict) else 0,
                "has_authentication": bool(request_data.get("headers", {}).get("Authorization")),
                "content_type": request_data.get("headers", {}).get("Content-Type", "not specified")
            }

        # 生成修复建议
        recommendations = self._generate_recommendations(api_error, request_data)
        report["recommendations"] = recommendations

        return report

    def _generate_recommendations(self, api_error: APIError, request_data: Dict = None) -> List[str]:
        """生成修复建议"""
        recommendations = []

        if api_error.error_type == ErrorType.VALIDATION_ERROR:
            recommendations.append("请检查请求数据的格式和必填字段")
            recommendations.append("验证字段值是否符合API文档要求")

            for error in api_error.details:
                if error.field:
                    recommendations.append(f"修复字段 '{error.field}': {error.message}")

        elif api_error.error_type == ErrorType.BUSINESS_RULE_ERROR:
            recommendations.append("检查业务逻辑是否违反API规则")
            recommendations.append("确认资源状态是否允许当前操作")

        elif api_error.error_type == ErrorType.RATE_LIMIT_ERROR:
            recommendations.append(f"等待 {api_error.retry_after or '建议'} 秒后重试")
            recommendations.append("考虑降低请求频率")

        elif api_error.error_type == ErrorType.AUTHENTICATION_ERROR:
            recommendations.append("检查API密钥或认证令牌是否有效")
            recommendations.append("确认是否有足够的权限执行此操作")

        elif api_error.error_type == ErrorType.NETWORK_ERROR:
            recommendations.append("检查网络连接")
            recommendations.append("稍后重试或联系技术支持")

        # 通用建议
        if api_error.retry_possible:
            recommendations.append("可以使用自动重试机制")
        else:
            recommendations.append("需要修改请求数据后重新提交")

        return recommendations

# 全局错误处理器实例
_api_error_handler = None

def get_api_error_handler() -> APIErrorHandler:
    """获取API错误处理器实例"""
    global _api_error_handler
    if _api_error_handler is None:
        _api_error_handler = APIErrorHandler()
    return _api_error_handler

def handle_api_response(response_data: Dict, status_code: int, request_data: Dict = None) -> Dict[str, Any]:
    """处理API响应的便捷函数"""
    handler = get_api_error_handler()

    if status_code >= 400:
        # 解析错误
        api_error = handler.parse_api_error(response_data, status_code)

        # 生成错误报告
        error_report = handler.generate_error_report(api_error, request_data)

        return {
            "success": False,
            "error": api_error,
            "report": error_report,
            "retry_request": handler.create_retry_request(request_data or {}, api_error)
        }
    else:
        return {
            "success": True,
            "data": response_data,
            "status_code": status_code
        }

def validate_and_fix_request(data: Dict, validation_rules: Dict) -> Dict[str, Any]:
    """验证和修复请求数据的便捷函数"""
    handler = get_api_error_handler()

    # 验证数据
    validation_result = handler.validate_request_data(data, validation_rules)

    if validation_result.is_valid:
        return {
            "valid": True,
            "data": validation_result.corrected_data or data,
            "warnings": validation_result.warnings
        }
    else:
        return {
            "valid": False,
            "errors": validation_result.errors,
            "warnings": validation_result.warnings
        }