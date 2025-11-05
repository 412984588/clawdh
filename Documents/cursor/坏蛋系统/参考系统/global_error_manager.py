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


全局错误管理器
集成到整个项目中,统一处理422和其他API错误
作者: Jenny团队
版本: 1.0.0
"""

import json
import time
import logging
import traceback
from typing import Dict, List, Optional, Any, Callable, Union, Tuple
from functools import wraps
from contextlib import contextmanager
import asyncio
from pathlib import Path

from api_error_handler import (
    get_api_error_handler,
    handle_api_response,
    APIError,
    ErrorType,
    ValidationError
)
from claude_code_optimizer import get_claude_optimizer, APIRequest

class GlobalErrorManager:
    """全局错误管理器

    为整个项目提供统一的错误处理,预防和恢复机制
    """

    def __init__(self, log_file: str = None):
        self.logger = logging.getLogger(__name__)
        self.error_handler = get_api_error_handler()
        self.claude_optimizer = get_claude_optimizer()

        # 错误统计
        self.error_stats = {
            "total_errors": 0,
            "error_types": {},
            "error_codes": {},
            "auto_fixes": 0,
            "successful_retries": 0
        }

        # 配置日志
        if log_file:
            self._setup_logging(log_file)

        # 项目特定的验证规则
        self.project_validation_rules = self._init_project_validation_rules()

    def _setup_logging(self, log_file: str):
        """设置错误日志"""
        # 确保日志目录存在
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        # 配置文件处理器
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.ERROR)

        # 配置格式
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)

        # 添加到logger
        self.logger.addHandler(file_handler)

    def _init_project_validation_rules(self) -> Dict[str, Dict]:
        """初始化项目特定的验证规则"""
        return {
            # 域名分析相关验证
            "domain_analysis": {
                "domain": {
                    "required": True,
                    "domain": True
                },
                "analysis_type": {
                    "required": True,
                    "string_length": {"min_length": 3, "max_length": 50}
                },
                "batch_size": {
                    "positive_number": True,
                    "number": {"min": 1, "max": 1000}
                }
            },

            # API请求相关验证
            "api_request": {
                "user_message": {
                    "required": True,
                    "string_length": {"min_length": 10, "max_length": 10000}
                },
                "session_id": {
                    "required": True,
                    "string_length": {"min_length": 5, "max_length": 100}
                },
                "context": {
                    "json": True
                }
            },

            # 数据文件相关验证
            "data_file": {
                "file_path": {
                    "required": True,
                    "string_length": {"min_length": 5, "max_length": 500}
                },
                "file_format": {
                    "required": True,
                    "string_length": {"min_length": 2, "max_length": 10}
                }
            }
        }

    def record_error(self, error: Union[APIError, Exception], context: Dict = None):
        """记录错误信息"""
        self.error_stats["total_errors"] += 1

        if isinstance(error, APIError):
            # 记录API错误
            error_type = error.error_type.value
            status_code = error.status_code

            self.error_stats["error_types"][error_type] = self.error_stats["error_types"].get(error_type, 0) + 1
            self.error_stats["error_codes"][status_code] = self.error_stats["error_codes"].get(status_code, 0) + 1

            self.logger.error(f"API错误 - 类型: {error_type}, 状态码: {status_code}, 消息: {error.message}")

            if error.details:
                for detail in error.details:
                    self.logger.error(f"  字段错误: {detail.field} - {detail.message}")

        else:
            # 记录一般异常
            error_type = type(error).__name__
            self.error_stats["error_types"][error_type] = self.error_stats["error_types"].get(error_type, 0) + 1

            self.logger.error(f"系统异常 - 类型: {error_type}, 消息: {str(error)}")
            self.logger.error(f"堆栈跟踪: {traceback.format_exc()}")

        # 记录上下文信息
        if context:
            self.logger.error(f"错误上下文: {json.dumps(context, ensure_ascii=False)}")

    def auto_fix_422_error(self, api_error: APIError, request_data: Dict, context: Dict = None) -> Tuple[bool, Dict]:
        """自动修复422错误"""
        if api_error.status_code != 422 or api_error.error_type != ErrorType.VALIDATION_ERROR:
            return False, request_data

        self.logger.info(f"尝试自动修复422错误: {api_error.message}")

        # 使用API错误处理器的自动修复功能
        can_fix, fixed_data = asyncio.run(
            self.error_handler.auto_fix_request(request_data, api_error)
        )

        if can_fix:
            self.error_stats["auto_fixes"] += 1
            self.logger.info("422错误自动修复成功")

            # 记录修复详情
            if context:
                context["auto_fix_applied"] = True
                context["original_error"] = api_error.message

            return True, fixed_data

        # 如果无法自动修复,尝试项目特定的修复策略
        return self._apply_project_specific_fixes(api_error, request_data, context)

    def _apply_project_specific_fixes(self, api_error: APIError, request_data: Dict, context: Dict = None) -> Tuple[bool, Dict]:
        """应用项目特定的修复策略"""
        fixed_data = request_data.copy()
        fixes_applied = []

        # 检查域名相关错误
        for error_detail in api_error.details:
            field = error_detail.field
            message = error_detail.message.lower()

            if "domain" in field and "invalid" in message:
                if field in fixed_data:
                    domain_value = fixed_data[field]
                    if isinstance(domain_value, str):
                        # 修复域名格式
                        if not domain_value.startswith(('http://', 'https://')):
                            fixed_data[field] = f"https://{domain_value}"
                            fixes_applied.append(f"为域名添加协议前缀: {field}")

            elif "batch_size" in field and ("too large" in message or "maximum" in message):
                if field in fixed_data:
                    # 限制批次大小
                    original_size = fixed_data[field]
                    fixed_data[field] = min(original_size, 100)
                    fixes_applied.append(f"限制批次大小: {field} 从 {original_size} 到 {fixed_data[field]}")

            elif "user_message" in field and ("too short" in message or "minimum" in message):
                if field in fixed_data:
                    # 扩展用户消息
                    original_message = fixed_data[field]
                    fixed_data[field] = f"{original_message}\n\n请提供详细的分析结果和具体建议."
                    fixes_applied.append(f"扩展用户消息长度: {field}")

        if fixes_applied:
            self.error_stats["auto_fixes"] += 1
            self.logger.info(f"应用项目特定修复: {'; '.join(fixes_applied)}")

            if context:
                context["project_specific_fixes"] = fixes_applied

            return True, fixed_data

        return False, request_data

    def validate_project_data(self, data: Dict, data_type: str, context: Dict = None) -> Tuple[bool, Dict]:
        """验证项目数据"""
        if data_type not in self.project_validation_rules:
            return True, data

        validation_rules = self.project_validation_rules[data_type]
        validation_result = handle_api_response({}, 200, data)  # 这里应该使用验证函数

        # 使用验证规则
        from api_error_handler import validate_and_fix_request
        validation_result = validate_and_fix_request(data, validation_rules)

        if validation_result["valid"]:
            return True, validation_result["data"]
        else:
            # 记录验证错误
            error_messages = [f"{error.field}: {error.message}" for error in validation_result["errors"]]
            self.logger.warning(f"数据验证失败 ({data_type}): {'; '.join(error_messages)}")

            if context:
                context["validation_errors"] = validation_result["errors"]

            return False, data

    def create_error_recovery_strategy(self, api_error: APIError, original_request: Any) -> Dict:
        """创建错误恢复策略"""
        strategy = {
            "error_type": api_error.error_type.value,
            "status_code": api_error.status_code,
            "can_auto_fix": False,
            "can_retry": api_error.retry_possible,
            "retry_delay": api_error.retry_after or 2,
            "max_retries": 3,
            "manual_actions": []
        }

        # 根据错误类型制定策略
        if api_error.error_type == ErrorType.VALIDATION_ERROR:
            if api_error.status_code == 422:
                strategy["can_auto_fix"] = True
                strategy["manual_actions"] = [
                    "检查请求数据格式",
                    "验证必填字段",
                    "确认字段值符合要求"
                ]

        elif api_error.error_type == ErrorType.BUSINESS_RULE_ERROR:
            strategy["manual_actions"] = [
                "检查业务逻辑约束",
                "确认资源状态",
                "验证操作权限"
            ]

        elif api_error.error_type == ErrorType.RATE_LIMIT_ERROR:
            strategy["retry_delay"] = api_error.retry_after or 60
            strategy["max_retries"] = 5
            strategy["manual_actions"] = [
                f"等待 {strategy['retry_delay']} 秒",
                "降低请求频率",
                "检查配额限制"
            ]

        elif api_error.error_type == ErrorType.NETWORK_ERROR:
            strategy["max_retries"] = 5
            strategy["retry_delay"] = 5
            strategy["manual_actions"] = [
                "检查网络连接",
                "验证API端点可用性",
                "联系技术支持"
            ]

        return strategy

    def generate_comprehensive_error_report(self) -> Dict:
        """生成综合错误报告"""
        current_time = time.strftime('%Y-%m-%d %H:%M:%S')

        report = {
            "report_timestamp": current_time,
            "error_statistics": self.error_stats.copy(),
            "health_status": self._calculate_health_status(),
            "recommendations": self._generate_recommendations(),
            "recent_errors": self._get_recent_errors()
        }

        return report

    def _calculate_health_status(self) -> Dict:
        """计算系统健康状态"""
        total_errors = self.error_stats["total_errors"]
        auto_fixes = self.error_stats["auto_fixes"]
        successful_retries = self.error_stats["successful_retries"]

        if total_errors == 0:
            health_score = 100
            status = "excellent"
        else:
            # 计算自动恢复率
            recovery_rate = (auto_fixes + successful_retries) / total_errors * 100

            if recovery_rate >= 80:
                health_score = 90 + (recovery_rate - 80) / 20 * 10
                status = "good"
            elif recovery_rate >= 60:
                health_score = 70 + (recovery_rate - 60) / 20 * 20
                status = "fair"
            elif recovery_rate >= 40:
                health_score = 50 + (recovery_rate - 40) / 20 * 20
                status = "poor"
            else:
                health_score = recovery_rate / 40 * 50
                status = "critical"

        return {
            "score": round(health_score, 1),
            "status": status,
            "total_errors": total_errors,
            "auto_recovery_rate": round((auto_fixes + successful_retries) / max(total_errors, 1) * 100, 1)
        }

    def _generate_recommendations(self) -> List[str]:
        """生成改进建议"""
        recommendations = []

        if self.error_stats["total_errors"] > 100:
            recommendations.append("错误数量较多,建议检查系统稳定性")

        # 检查最常见的错误类型
        if self.error_stats["error_types"]:
            most_common_error = max(self.error_stats["error_types"].items(), key=lambda x: x[1])
            error_type, count = most_common_error

            if error_type == "validation_error" and count > 20:
                recommendations.append("验证错误较多,建议加强输入数据验证")
            elif error_type == "rate_limit_error" and count > 10:
                recommendations.append("频率限制错误较多,建议降低请求频率")
            elif error_type == "network_error" and count > 15:
                recommendations.append("网络错误较多,建议检查网络连接和API可用性")

        # 检查自动修复率
        total_errors = self.error_stats["total_errors"]
        if total_errors > 0:
            auto_fix_rate = self.error_stats["auto_fixes"] / total_errors * 100
            if auto_fix_rate < 50:
                recommendations.append("自动修复率较低,建议优化错误处理逻辑")

        if not recommendations:
            recommendations.append("系统运行良好,继续保持")

        return recommendations

    def _get_recent_errors(self) -> List[Dict]:
        """获取最近的错误信息(简化版)"""
        # 在实际应用中,这里会从日志或数据库中读取最近的错误
        return [
            {
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
                "type": error_type,
                "count": count
            }
            for error_type, count in list(self.error_stats["error_types"].items())[:5]
        ]

# 全局错误管理器实例
_global_error_manager = None

def get_global_error_manager(log_file: str = None) -> GlobalErrorManager:
    """获取全局错误管理器实例"""
    global _global_error_manager
    if _global_error_manager is None:
        _global_error_manager = GlobalErrorManager(log_file)
    return _global_error_manager

def safe_api_call(max_retries: int = 3, data_type: str = None):
    """API调用安全装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            error_manager = get_global_error_manager()

            for attempt in range(max_retries + 1):
                try:
                    # 验证请求数据
                    if data_type and args:
                        is_valid, validated_data = error_manager.validate_project_data(
                            args[0] if args else {}, data_type
                        )
                        if not is_valid:
                            raise ValueError(f"数据验证失败: {data_type}")

                        # 替换原始参数
                        args = (validated_data,) + args[1:]

                    # 执行函数
                    result = await func(*args, **kwargs)

                    # 如果是最后一次尝试成功,更新统计
                    if attempt > 0:
                        error_manager.error_stats["successful_retries"] += 1

                    return result

                except Exception as e:
                    context = {
                        "function": func.__name__,
                        "attempt": attempt + 1,
                        "max_retries": max_retries + 1,
                        "args_count": len(args),
                        "kwargs_keys": list(kwargs.keys())
                    }

                    # 检查是否是API错误
                    if hasattr(e, 'status_code') and e.status_code == 422:
                        api_error = error_manager.error_handler.parse_api_error(
                            getattr(e, 'response_data', {}), e.status_code
                        )

                        # 尝试自动修复
                        if args:
                            can_fix, fixed_data = error_manager.auto_fix_422_error(
                                api_error, args[0], context
                            )
                            if can_fix:
                                args = (fixed_data,) + args[1:]
                                error_manager.logger.info(f"自动修复422错误,重试: {func.__name__}")
                                continue

                    # 记录错误
                    error_manager.record_error(e, context)

                    # 如果还有重试机会,等待后重试
                    if attempt < max_retries:
                        delay = 2 ** attempt
                        error_manager.logger.warning(f"函数 {func.__name__} 失败,{delay}秒后重试: {e}")
                        await asyncio.sleep(delay)
                    else:
                        # 所有重试都失败了
                        error_manager.logger.error(f"函数 {func.__name__} 最终失败: {e}")
                        raise

            return None

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            error_manager = get_global_error_manager()

            for attempt in range(max_retries + 1):
                try:
                    # 验证请求数据
                    if data_type and args:
                        is_valid, validated_data = error_manager.validate_project_data(
                            args[0] if args else {}, data_type
                        )
                        if not is_valid:
                            raise ValueError(f"数据验证失败: {data_type}")

                        # 替换原始参数
                        args = (validated_data,) + args[1:]

                    # 执行函数
                    result = func(*args, **kwargs)

                    # 如果是最后一次尝试成功,更新统计
                    if attempt > 0:
                        error_manager.error_stats["successful_retries"] += 1

                    return result

                except Exception as e:
                    context = {
                        "function": func.__name__,
                        "attempt": attempt + 1,
                        "max_retries": max_retries + 1,
                        "args_count": len(args),
                        "kwargs_keys": list(kwargs.keys())
                    }

                    # 检查是否是API错误
                    if hasattr(e, 'status_code') and e.status_code == 422:
                        api_error = error_manager.error_handler.parse_api_error(
                            getattr(e, 'response_data', {}), e.status_code
                        )

                        # 尝试自动修复
                        if args:
                            can_fix, fixed_data = error_manager.auto_fix_422_error(
                                api_error, args[0], context
                            )
                            if can_fix:
                                args = (fixed_data,) + args[1:]
                                error_manager.logger.info(f"自动修复422错误,重试: {func.__name__}")
                                continue

                    # 记录错误
                    error_manager.record_error(e, context)

                    # 如果还有重试机会,等待后重试
                    if attempt < max_retries:
                        delay = 2 ** attempt
                        error_manager.logger.warning(f"函数 {func.__name__} 失败,{delay}秒后重试: {e}")
                        time.sleep(delay)
                    else:
                        # 所有重试都失败了
                        error_manager.logger.error(f"函数 {func.__name__} 最终失败: {e}")
                        raise

            return None

        # 根据函数类型返回相应的包装器
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator

@contextmanager
def global_error_context(operation_name: str, context: Dict = None):
    """全局错误上下文管理器"""
    error_manager = get_global_error_manager()

    start_time = time.time()
    operation_context = {
        "operation": operation_name,
        "start_time": start_time,
        **(context or {})
    }

    try:
        yield error_manager
        # 操作成功
        duration = time.time() - start_time
        operation_context["duration"] = duration
        operation_context["status"] = "success"

        error_manager.logger.info(f"操作成功: {operation_name} (耗时: {duration:.2f}秒)")

    except Exception as e:
        # 操作失败
        duration = time.time() - start_time
        operation_context["duration"] = duration
        operation_context["status"] = "failed"
        operation_context["error"] = str(e)

        error_manager.record_error(e, operation_context)
        error_manager.logger.error(f"操作失败: {operation_name} (耗时: {duration:.2f}秒)")
        raise

# 便捷函数
def handle_project_error(error: Union[Exception, APIError], operation: str = None, data: Dict = None):
    """处理项目错误的便捷函数"""
    error_manager = get_global_error_manager()

    context = {
        "operation": operation,
        "data_summary": {k: type(v).__name__ for k, v in (data or {}).items()}
    }

    error_manager.record_error(error, context)

    # 如果是422错误,尝试自动修复
    if isinstance(error, APIError) and error.status_code == 422:
        if data:
            can_fix, fixed_data = error_manager.auto_fix_422_error(error, data, context)
            if can_fix:
                return {
                    "success": True,
                    "fixed_data": fixed_data,
                    "message": "422错误已自动修复"
                }

    return {
        "success": False,
        "error": error,
        "message": "错误处理完成,无法自动修复"
    }

def initialize_global_error_management(log_file: str = None):
    """初始化全局错误管理"""
    error_manager = get_global_error_manager(log_file)

    error_manager.logger.info("全局错误管理器已初始化")

    return error_manager

# 项目启动时调用
def setup_project_error_handling():
    """设置项目错误处理"""
    # 设置错误日志文件
    log_file = "/Users/zhimingdeng/Projects/女王条纹测试2/logs/error_management.log"

    # 初始化全局错误管理器
    error_manager = initialize_global_error_management(log_file)

    # 记录初始化
    error_manager.logger.info("女王条纹测试2项目错误处理系统已启动")

    return error_manager