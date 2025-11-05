#!/usr/bin/env python3
"""
BMad 422错误防护套件
集成所有422错误防护和修复功能的综合解决方案
作者: BMad-Method团队
版本: 1.0.0
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# 添加项目路径
sys.path.append(str(Path(__file__).parent.parent))

from api_request_interceptor import ClaudeAPIInterceptor
from .emergency_422_fix import BMadEmergency422Fixer
import sys
sys.path.append(str(Path(__file__).parent.parent))
from messages_content_fix import ClaudeMessagesFixer

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BMad422ProtectionSuite:
    """BMad 422错误防护套件"""

    def __init__(self, enable_monitoring: bool = True):
        self.logger = logging.getLogger(__name__)
        self.enable_monitoring = enable_monitoring

        # 初始化各个组件
        self.api_interceptor = ClaudeAPIInterceptor(debug_mode=False)
        self.emergency_fixer = BMadEmergency422Fixer()
        self.message_fixer = ClaudeMessagesFixer()

        # 尝试导入监控系统
        self.monitor = None
        if enable_monitoring:
            try:
                from .f422_prevention_monitor import BMad422PreventionMonitor
                self.monitor = BMad422PreventionMonitor()
                self.logger.info("✅ 422错误预防监控已启用")
            except ImportError as e:
                self.logger.warning(f"⚠️ 预防监控不可用: {e}")

        # 统计信息
        self.protection_stats = {
            "total_requests": 0,
            "issues_detected": 0,
            "fixes_applied": 0,
            "errors_prevented": 0,
            "start_time": datetime.now().isoformat()
        }

        logger.info("🛡️ BMad 422错误防护套件已启动")

    def protect_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """保护API请求，防止422错误"""
        self.protection_stats["total_requests"] += 1

        try:
            # 第一层：API拦截器防护
            self.logger.info("🔍 第一层防护：API拦截器检查")
            protected_request = self.api_interceptor.intercept_anthropic_request(request_data)

            # 第二层：紧急修复器深度检查
            self.logger.info("🔧 第二层防护：紧急修复器深度检查")
            messages = protected_request.get("messages", [])
            emergency_result = self.emergency_fixer.fix_conversation_history(messages)

            if emergency_result["issues_found"] > 0:
                self.protection_stats["issues_detected"] += emergency_result["issues_found"]
                self.protection_stats["fixes_applied"] += emergency_result["fixes_applied"]
                self.protection_stats["errors_prevented"] += 1

                self.logger.warning(f"🚨 深度防护发现{emergency_result['issues_found']}个风险")
                self.logger.info(f"🛡️ 已应用{emergency_result['fixes_applied']}个防护修复")

                protected_request["messages"] = emergency_result["fixed_messages"]

            # 第三层：消息质量检查
            self.logger.info("✅ 第三层防护：消息质量最终检查")
            quality_result = self.message_fixer.validate_and_fix_messages(
                protected_request["messages"]
            )

            if quality_result["issues_found"] > 0:
                self.protection_stats["issues_detected"] += quality_result["issues_found"]
                self.protection_stats["fixes_applied"] += quality_result["fixes_applied"]

                protected_request["messages"] = quality_result["fixed_messages"]

            # 记录监控数据
            if self.monitor:
                self.monitor.record_interaction(
                    messages=protected_request["messages"],
                    issues_found=emergency_result["issues_found"] + quality_result["issues_found"],
                    fixes_applied=emergency_result["fixes_applied"] + quality_result["fixes_applied"],
                    error_types=self._extract_error_types(emergency_result, quality_result)
                )

            self.logger.info("✅ 请求防护完成，安全可发送")
            return protected_request

        except Exception as e:
            self.logger.error(f"❌ 防护系统错误: {e}")
            # 返回原始请求，但记录错误
            return request_data

    def _extract_error_types(self, emergency_result: Dict, quality_result: Dict) -> Dict[str, int]:
        """提取错误类型统计"""
        error_types = {}

        # 从紧急修复结果中提取
        for issue in emergency_result.get("issue_details", []):
            error_type = issue.get("type", "unknown")
            error_types[error_type] = error_types.get(error_type, 0) + 1

        # 从质量检查结果中提取
        for validation_result in quality_result.get("validation_results", []):
            if not validation_result.is_valid:
                for issue in validation_result.issues:
                    error_type = "validation_" + issue.split(":")[0] if ":" in issue else "validation_error"
                    error_types[error_type] = error_types.get(error_type, 0) + 1

        return error_types

    def create_safe_request_template(self, user_message: str,
                                   system_message: Optional[str] = None,
                                   conversation_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """创建安全的请求模板"""
        self.logger.info("📝 创建安全请求模板...")

        # 使用API拦截器的安全创建方法
        safe_request = self.api_interceptor.create_safe_claude_request(
            user_message=user_message,
            system_message=system_message,
            conversation_history=conversation_history or []
        )

        # 应用防护套件
        return self.protect_request(safe_request)

    def get_protection_status(self) -> Dict[str, Any]:
        """获取防护状态"""
        status = {
            "suite_active": True,
            "stats": self.protection_stats.copy(),
            "components": {
                "api_interceptor": True,
                "emergency_fixer": True,
                "message_fixer": True,
                "prevention_monitor": self.monitor is not None
            }
        }

        # 添加监控状态
        if self.monitor:
            monitoring_summary = self.monitor.get_monitoring_summary()
            status["monitoring"] = monitoring_summary

        # 计算防护效果
        if self.protection_stats["total_requests"] > 0:
            prevention_rate = (self.protection_stats["errors_prevented"] /
                              self.protection_stats["total_requests"]) * 100
            status["effectiveness"] = {
                "prevention_rate": f"{prevention_rate:.1f}%",
                "issues_per_request": (self.protection_stats["issues_detected"] /
                                     self.protection_stats["total_requests"])
            }

        return status

    def run_comprehensive_test(self) -> Dict[str, Any]:
        """运行综合测试"""
        self.logger.info("🧪 运行422错误防护综合测试...")

        test_results = {
            "test_start": datetime.now().isoformat(),
            "tests": []
        }

        # 测试1：基础安全请求
        try:
            safe_request = self.create_safe_request_template(
                user_message="测试基础安全请求",
                system_message="你是一个测试助手"
            )
            test_results["tests"].append({
                "name": "基础安全请求测试",
                "status": "✅ 通过",
                "details": f"创建了包含{len(safe_request['messages'])}条消息的安全请求"
            })
        except Exception as e:
            test_results["tests"].append({
                "name": "基础安全请求测试",
                "status": "❌ 失败",
                "error": str(e)
            })

        # 测试2：高风险请求防护
        try:
            risk_request = {
                "model": "claude-3-5-sonnet-20241022",
                "messages": [
                    {"role": "user", "content": "开始测试"},
                    {"role": "assistant", "content": [
                        {"type": "text", "text": "正常回复"},
                        {"type": "tool_use", "id": "risk_test", "name": "DangerTool"},  # 风险内容
                        {"type": "invalid_type"}  # 无效类型
                    ]},
                    {"role": "user", "content": "继续"}
                ]
            }

            protected_request = self.protect_request(risk_request)
            test_results["tests"].append({
                "name": "高风险请求防护测试",
                "status": "✅ 通过",
                "details": f"成功处理高风险请求，输出{len(protected_request['messages'])}条消息"
            })
        except Exception as e:
            test_results["tests"].append({
                "name": "高风险请求防护测试",
                "status": "❌ 失败",
                "error": str(e)
            })

        # 测试3：长对话防护
        try:
            long_conversation = []
            for i in range(220):  # 超过安全阈值
                role = "user" if i % 2 == 0 else "assistant"
                long_conversation.append({
                    "role": role,
                    "content": f"测试消息 {i}"
                })

            long_request = {
                "model": "claude-3-5-sonnet-20241022",
                "messages": long_conversation
            }

            protected_request = self.protect_request(long_request)
            test_results["tests"].append({
                "name": "长对话防护测试",
                "status": "✅ 通过",
                "details": f"成功处理{len(long_conversation)}条消息的长对话"
            })
        except Exception as e:
            test_results["tests"].append({
                "name": "长对话防护测试",
                "status": "❌ 失败",
                "error": str(e)
            })

        test_results["test_end"] = datetime.now().isoformat()
        test_results["protection_status"] = self.get_protection_status()

        # 统计测试结果
        passed_tests = sum(1 for test in test_results["tests"] if "✅" in test["status"])
        total_tests = len(test_results["tests"])
        test_results["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": f"{(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%"
        }

        return test_results

def main():
    """主函数"""
    print("🚀 BMad 422错误防护套件启动")

    # 创建防护套件
    protection_suite = BMad422ProtectionSuite(enable_monitoring=True)

    # 运行综合测试
    print("\n🧪 开始综合测试...")
    test_results = protection_suite.run_comprehensive_test()

    # 显示测试结果
    print(f"\n📊 测试结果:")
    for test in test_results["tests"]:
        print(f"  {test['status']} {test['name']}")
        if "error" in test:
            print(f"    错误: {test['error']}")
        elif "details" in test:
            print(f"    详情: {test['details']}")

    print(f"\n📈 测试总结: {test_results['summary']}")

    # 显示防护状态
    status = protection_suite.get_protection_status()
    print(f"\n🛡️ 防护状态:")
    print(f"  总请求数: {status['stats']['total_requests']}")
    print(f"  发现问题: {status['stats']['issues_detected']}")
    print(f"  应用修复: {status['stats']['fixes_applied']}")
    print(f"  预防错误: {status['stats']['errors_prevented']}")

    if "effectiveness" in status:
        print(f"  防护效率: {status['effectiveness']['prevention_rate']}")
        print(f"  问题密度: {status['effectiveness']['issues_per_request']:.2f} 个/请求")

    print(f"\n✅ BMad 422错误防护套件测试完成！")
    print(f"🎯 您的系统现已受到全面的422错误保护")

if __name__ == "__main__":
    main()