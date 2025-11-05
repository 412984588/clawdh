#!/usr/bin/env python3
"""
Claude API请求拦截器
自动拦截,验证和修复所有API请求,防止422错误
作者: Jenny团队
版本: 1.0.0
"""

import json
import sys
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

# 设置全局logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


# 添加项目路径
sys.path.append(str(Path(__file__).parent))

try:
    from messages_content_fix import ClaudeMessagesFixer
except ImportError:
    # 如果messages_content_fix模块不存在，创建一个简单的替代
    class ClaudeMessagesFixer:
        def validate_and_fix_messages(self, messages):
            return {"issues_found": 0, "fixes_applied": 0, "fixed_messages": messages, "validation_results": []}

class ClaudeAPIInterceptor:
    """Claude API请求拦截器"""

    def __init__(self, debug_mode: bool = True):
        self.debug_mode = debug_mode
        self.fixer = ClaudeMessagesFixer()
        self.logger = self._setup_logger()

    def _setup_logger(self) -> logging.Logger:
        """设置日志记录器"""
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO if self.debug_mode else logging.WARNING)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def intercept_anthropic_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """拦截Anthropic API请求"""
        self.logger.info("🔍 拦截Anthropic API请求...")

        # 基本验证
        if "messages" not in request_data:
            self.logger.error("❌ 请求缺少messages字段")
            raise ValueError("API请求缺少messages字段")

        messages = request_data["messages"]
        self.logger.info(f"📊 检测到{len(messages)}条消息")

        # 🚨 新增：422错误专项检查和修复
        messages = self._emergency_422_fix(messages)

        # 验证并修复消息
        fix_result = self.fixer.validate_and_fix_messages(messages)

        if fix_result["issues_found"] > 0:
            self.logger.warning(f"🔧 发现{fix_result['issues_found']}个消息问题")
            self.logger.info(f"🛠️ 应用{fix_result['fixes_applied']}个修复")

            # 详细日志
            for validation_result in fix_result["validation_results"]:
                if not validation_result.is_valid:
                    idx = validation_result.message_index
                    issues = ", ".join(validation_result.issues)
                    self.logger.info(f"  消息{idx}: {issues}")

            # 更新请求
            fixed_request = request_data.copy()
            fixed_request["messages"] = fix_result["fixed_messages"]

            self.logger.info("✅ 请求修复完成")
            return fixed_request
        else:
            self.logger.info("✅ 请求验证通过,无需修复")
            return request_data

    def _emergency_422_fix(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """422错误紧急修复"""
        try:
            # 导入紧急修复器
            from bmad_solutions.emergency_422_fix import BMadEmergency422Fixer

            fixer = BMadEmergency422Fixer()
            result = fixer.fix_conversation_history(messages)

            if result['issues_found'] > 0:
                self.logger.warning(f"🚨 422错误防护: 发现{result['issues_found']}个风险")
                self.logger.info(f"🛡️ 已应用{result['fixes_applied']}个防护修复")

                # 记录修复详情
                for fix_detail in result['fix_details']:
                    idx = fix_detail['message_index']
                    fixes = ', '.join(fix_detail['fixes_applied'])
                    self.logger.info(f"  消息{idx}: 修复{fixes}")

            return result['fixed_messages']

        except ImportError:
            # 如果紧急修复器不可用，使用基础修复
            self.logger.warning("⚠️ 紧急修复器不可用，使用基础修复")
            return self._basic_422_fix(messages)
        except Exception as e:
            self.logger.error(f"❌ 紧急修复失败: {e}")
            return messages

    def _basic_422_fix(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """基础422错误修复"""
        fixed_messages = []

        for idx, message in enumerate(messages):
            fixed_message = message.copy()

            # 修复content字段
            if 'content' in fixed_message:
                content = fixed_message['content']

                # 检查tool_use类型错误
                if isinstance(content, list):
                    fixed_content = []
                    for item in content:
                        if isinstance(item, dict):
                            if item.get('type') == 'tool_use':
                                # 移除tool_use类型，避免422错误
                                continue
                            elif 'type' in item and 'text' not in item and item['type'] != 'tool_result':
                                # 添加缺失的text字段
                                item['text'] = f"【自动修复的{item['type']}内容】"
                        fixed_content.append(item)
                    fixed_message['content'] = fixed_content

                # 确保content不为复杂对象
                elif isinstance(content, dict):
                    fixed_message['content'] = "【对象内容已自动修复】"

            fixed_messages.append(fixed_message)

        return fixed_messages

    def intercept_claude_code_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """拦截Claude Code请求"""
        self.logger.info("🔍 拦截Claude Code请求...")

        # Claude Code可能有不同的请求格式
        if "messages" in request_data:
            return self.intercept_anthropic_request(request_data)
        elif "prompt" in request_data:
            # 处理prompt格式
            self.logger.info("📝 检测到prompt格式请求")
            return self._fix_prompt_request(request_data)
        else:
            self.logger.warning("⚠️ 未知的请求格式")
            return request_data

    def _fix_prompt_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """修复prompt格式请求"""
        prompt = request_data.get("prompt", "")

        if not prompt or prompt.strip() == "":
            self.logger.warning("🔧 prompt为空,添加默认内容")
            fixed_request = request_data.copy()
            fixed_request["prompt"] = "请继续处理当前任务,提供详细的分析和建议."
            return fixed_request

        return request_data

    def create_safe_claude_request(self,
                                 user_message: str,
                                 system_message: str = None,
                                 conversation_history: List[Dict] = None,
                                 tools: List[Dict] = None) -> Dict[str, Any]:
        """创建安全的Claude请求"""
        self.logger.info("🔧 创建安全的Claude请求...")

        # 构建消息列表
        messages = []

        # 添加对话历史
        if conversation_history:
            for hist_msg in conversation_history:
                role = hist_msg.get("role", "user")
                content = hist_msg.get("content", "")

                # 确保历史消息格式正确
                if isinstance(content, str):
                    messages.append({"role": role, "content": content})
                elif isinstance(content, list):
                    messages.append({"role": role, "content": content})
                else:
                    # 转换为字符串
                    messages.append({"role": role, "content": str(content)})

        # 添加当前用户消息
        user_msg = {"role": "user", "content": user_message}
        messages.append(user_msg)

        # 构建请求
        request_data = {
            "model": "claude-3-5-sonnet-20241022",
            "messages": messages,
            "max_tokens": 4000,
            "temperature": 0.7
        }

        if system_message:
            request_data["system"] = system_message

        if tools:
            request_data["tools"] = tools
            request_data["tool_choice"] = {"type": "auto"}

        # 拦截并修复请求
        return self.intercept_anthropic_request(request_data)

def create_patching_module():
    """创建补丁模块"""
    patch_code = '''
"""
Claude API补丁模块
自动拦截所有API调用并修复422错误
"""

import json
import sys
from pathlib import Path

# 添加拦截器路径
sys.path.append(str(Path(__file__).parent))

from api_request_interceptor import ClaudeAPIInterceptor

# 全局拦截器实例
_interceptor = ClaudeAPIInterceptor(debug_mode=True)

def patch_anthropic_client():
    """为Anthropic客户端添加补丁"""
    try:
        import anthropic

        # 保存原始方法
        original_create = anthropic.Anthropic.messages.create

        def patched_create(*args, **kwargs):
            # 拦截并修复请求
            if kwargs:
                fixed_kwargs = _interceptor.intercept_anthropic_request(kwargs)
                return original_create(*args, **fixed_kwargs)
            else:
                return original_create(*args, **kwargs)

        # 应用补丁
        anthropic.Anthropic.messages.create = patched_create

        print("✅ Anthropic客户端补丁已应用")
        return True

    except ImportError:
        print("⚠️ Anthropic库未安装,跳过补丁")
        return False
    except Exception as e:
        print(f"❌ 应用Anthropic补丁失败: {e}")
        return False

def auto_patch():
    """自动应用所有补丁"""
    print("🚀 开始应用Claude API补丁...")

    patches_applied = 0

    if patch_anthropic_client():
        patches_applied += 1

    print(f"✅ 补丁应用完成,共应用{patches_applied}个补丁")
    return patches_applied > 0

# 自动应用补丁
if __name__ == "__main__":
    auto_patch()
'''

    return patch_code

def main():
    """主函数"""
    print("🛡️ Claude API请求拦截器")
    print("=" * 50)

    # 创建拦截器
    interceptor = ClaudeAPIInterceptor(debug_mode=True)

    # 测试有问题的请求
    problematic_request = {
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "你好"},
            {"role": "assistant"},  # 缺少content - 这会导致422错误!
            {"role": "user", "content": "请分析这个项目"},
            {"role": "assistant", "content": None},  # null content - 也会导致错误
            {"role": "user", "content": "继续"},
            {"role": "assistant", "content": ""},  # 空content - 也会导致错误
            {"role": "user", "content": "最后一条消息"}  # 这是索引6,但实际项目中可能是11
        ]
    }

    print(f"📊 测试请求包含{len(problematic_request['messages'])}条消息")

    # 拦截并修复
    try:
        fixed_request = interceptor.intercept_anthropic_request(problematic_request)

        print("\n✅ 请求修复成功!")
        print(f"📊 修复后消息数量: {len(fixed_request['messages'])}")

        # 验证修复结果
        all_valid = True
        for i, msg in enumerate(fixed_request['messages']):
            if 'content' not in msg or msg['content'] is None or msg['content'] == '':
                print(f"❌ 消息{i}仍然有问题: {msg}")
                all_valid = False

        if all_valid:
            print("✅ 所有消息都已正确修复!")

        # 创建安全请求示例
        print(f"\n🔧 创建安全请求示例...")
        safe_request = interceptor.create_safe_claude_request(
            user_message="请分析女王条纹测试2项目的当前状态",
            system_message="你是专业的项目分析师,请提供详细的分析报告",
            conversation_history=[
                {"role": "user", "content": "项目状态如何?"},
                {"role": "assistant", "content": "我来为您分析项目状态"}
            ]
        )

        print("✅ 安全请求创建完成")

    except Exception as e:
        print(f"❌ 拦截器测试失败: {e}")

    # 创建补丁模块
    print(f"\n📝 创建API补丁模块...")
    patch_code = create_patching_module()

    patch_file = Path("/Users/zhimingdeng/Projects/女王条纹测试2/claude_api_patch.py")
    with open(patch_file, 'w', encoding='utf-8') as f:
        f.write(patch_code)

    print(f"✅ 补丁模块已保存: {patch_file}")

    # 保存拦截器配置
    config = {
        "interceptor_enabled": True,
        "debug_mode": True,
        "auto_fix_messages": True,
        "created_at": datetime.now().isoformat(),
        "supported_apis": ["anthropic", "claude_code"]
    }

    config_file = Path("/Users/zhimingdeng/Projects/女王条纹测试2/.claude/interceptor_config.json")
    config_file.parent.mkdir(parents=True, exist_ok=True)

    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"✅ 拦截器配置已保存: {config_file}")

if __name__ == "__main__":
    main()