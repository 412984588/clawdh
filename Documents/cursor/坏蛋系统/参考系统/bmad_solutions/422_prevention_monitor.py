#!/usr/bin/env python3
"""
BMad 422错误预防监控系统
实时监控和预防Claude API 422错误
作者: BMad-Method团队
版本: 1.0.0
"""

import json
import time
import threading
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import deque
import weakref

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MessageQualityMetrics:
    """消息质量指标"""
    timestamp: datetime
    message_count: int
    issues_detected: int
    fixes_applied: int
    risk_score: float
    error_types: Dict[str, int] = field(default_factory=dict)

@dataclass
class PreventionAlert:
    """预防警报"""
    alert_type: str
    severity: str
    message: str
    timestamp: datetime
    suggestions: List[str]
    metrics: MessageQualityMetrics

class BMad422PreventionMonitor:
    """BMad 422错误预防监控器"""

    def __init__(self, enable_monitoring: bool = True):
        self.logger = logging.getLogger(__name__)
        self.enable_monitoring = enable_monitoring

        # 监控数据
        self.metrics_history = deque(maxlen=100)  # 保留最近100次交互的数据
        self.alert_history = deque(maxlen=50)     # 保留最近50个警报

        # 预防阈值
        self.thresholds = {
            'risk_score_high': 0.7,
            'risk_score_critical': 0.9,
            'message_count_warning': 200,
            'message_count_critical': 250,
            'error_rate_warning': 0.1,
            'error_rate_critical': 0.2
        }

        # 预防策略
        self.prevention_strategies = {
            'high_risk_score': self._apply_high_risk_prevention,
            'critical_message_count': self._apply_message_count_prevention,
            'elevated_error_rate': self._apply_error_rate_prevention,
            'repeated_error_types': self._apply_error_pattern_prevention
        }

        # 监控状态
        self.monitoring_active = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.last_check_time = datetime.now()

        # 预防措施回调
        self.prevention_callbacks: List[Callable] = []

        if self.enable_monitoring:
            self.start_monitoring()

    def start_monitoring(self):
        """启动监控"""
        if not self.monitoring_active:
            self.monitoring_active = True
            self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitor_thread.start()
            self.logger.info("🛡️ 422错误预防监控已启动")

    def stop_monitoring(self):
        """停止监控"""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1)
        self.logger.info("⏹️ 422错误预防监控已停止")

    def record_interaction(self, messages: List[Dict[str, Any]],
                          issues_found: int, fixes_applied: int,
                          error_types: Dict[str, int]):
        """记录交互数据"""
        if not self.enable_monitoring:
            return

        # 计算风险分数
        risk_score = self._calculate_risk_score(
            len(messages), issues_found, fixes_applied, error_types
        )

        metrics = MessageQualityMetrics(
            timestamp=datetime.now(),
            message_count=len(messages),
            issues_detected=issues_found,
            fixes_applied=fixes_applied,
            risk_score=risk_score,
            error_types=error_types.copy()
        )

        self.metrics_history.append(metrics)
        self.last_check_time = datetime.now()

        # 实时风险评估
        self._assess_risk_and_alert(metrics)

    def _calculate_risk_score(self, message_count: int, issues_found: int,
                             fixes_applied: int, error_types: Dict[str, int]) -> float:
        """计算风险分数"""
        base_score = 0.0

        # 消息数量风险 (0-0.3)
        if message_count > self.thresholds['message_count_critical']:
            base_score += 0.3
        elif message_count > self.thresholds['message_count_warning']:
            base_score += 0.15

        # 问题密度风险 (0-0.4)
        if message_count > 0:
            issue_density = issues_found / message_count
            base_score += min(issue_density * 2, 0.4)

        # 修复频率风险 (0-0.2)
        if issues_found > 0:
            fix_rate = fixes_applied / issues_found
            if fix_rate < 0.5:  # 修复率低表示问题严重
                base_score += 0.2
            else:
                base_score += 0.1

        # 错误类型风险 (0-0.1)
        critical_errors = sum(count for error_type, count in error_types.items()
                            if 'tool_use' in error_type or 'critical' in error_type)
        if critical_errors > 0:
            base_score += 0.1

        return min(base_score, 1.0)

    def _assess_risk_and_alert(self, metrics: MessageQualityMetrics):
        """评估风险并生成警报"""
        alerts = []

        # 高风险分数警报
        if metrics.risk_score >= self.thresholds['risk_score_critical']:
            alerts.append(PreventionAlert(
                alert_type='critical_risk_score',
                severity='critical',
                message=f"🚨 临界风险分数: {metrics.risk_score:.2f}",
                timestamp=datetime.now(),
                suggestions=[
                    "立即清理对话历史",
                    "检查所有工具调用格式",
                    "考虑重新开始对话"
                ],
                metrics=metrics
            ))
        elif metrics.risk_score >= self.thresholds['risk_score_high']:
            alerts.append(PreventionAlert(
                alert_type='high_risk_score',
                severity='high',
                message=f"⚠️ 高风险分数: {metrics.risk_score:.2f}",
                timestamp=datetime.now(),
                suggestions=[
                    "检查最近的工具调用",
                    "验证消息格式",
                    "考虑精简对话历史"
                ],
                metrics=metrics
            ))

        # 消息数量警报
        if metrics.message_count >= self.thresholds['message_count_critical']:
            alerts.append(PreventionAlert(
                alert_type='critical_message_count',
                severity='critical',
                message=f"🚨 对话过长: {metrics.message_count} 条消息",
                timestamp=datetime.now(),
                suggestions=[
                    "立即压缩对话历史",
                    "移除不必要的上下文",
                    "重新开始关键对话"
                ],
                metrics=metrics
            ))

        # 错误率警报
        if metrics.message_count > 0:
            error_rate = metrics.issues_detected / metrics.message_count
            if error_rate >= self.thresholds['error_rate_critical']:
                alerts.append(PreventionAlert(
                    alert_type='critical_error_rate',
                    severity='critical',
                    message=f"🚨 错误率过高: {error_rate:.2%}",
                    timestamp=datetime.now(),
                    suggestions=[
                        "全面检查消息格式",
                        "修复所有识别的问题",
                        "启用严格验证模式"
                    ],
                    metrics=metrics
                ))

        # 记录警报
        for alert in alerts:
            self.alert_history.append(alert)
            self.logger.warning(f"{alert.message}")

        # 触发预防措施
        self._trigger_prevention_measures(alerts)

    def _trigger_prevention_measures(self, alerts: List[PreventionAlert]):
        """触发预防措施"""
        for alert in alerts:
            strategy_name = alert.alert_type.replace('critical_', '').replace('high_', '')

            if strategy_name in self.prevention_strategies:
                self.logger.info(f"🛡️ 启动预防策略: {strategy_name}")
                try:
                    self.prevention_strategies[strategy_name](alert)
                except Exception as e:
                    self.logger.error(f"❌ 预防策略执行失败: {e}")

        # 通知所有回调
        for callback in self.prevention_callbacks:
            try:
                callback(alerts)
            except Exception as e:
                self.logger.error(f"❌ 预防回调执行失败: {e}")

    def _apply_high_risk_prevention(self, alert: PreventionAlert):
        """应用高风险预防措施"""
        suggestions = [
            "📋 建议立即执行的操作:",
            "1. 检查最近10条消息的格式",
            "2. 清理任何工具调用残留",
            "3. 验证所有content字段为有效字符串",
            "4. 考虑重新开始复杂对话"
        ]
        for suggestion in suggestions:
            self.logger.info(suggestion)

    def _apply_message_count_prevention(self, alert: PreventionAlert):
        """应用消息数量预防措施"""
        suggestions = [
            "📉 对话长度管理建议:",
            "1. 精简对话历史，保留关键信息",
            "2. 移除重复或不必要的消息",
            "3. 考虑分批处理长对话",
            "4. 重置对话状态以避免累积错误"
        ]
        for suggestion in suggestions:
            self.logger.info(suggestion)

    def _apply_error_rate_prevention(self, alert: PreventionAlert):
        """应用错误率预防措施"""
        suggestions = [
            "🔧 错误率控制建议:",
            "1. 启用严格的消息验证",
            "2. 使用增强的API拦截器",
            "3. 定期检查消息完整性",
            "4. 实施自动错误恢复机制"
        ]
        for suggestion in suggestions:
            self.logger.info(suggestion)

    def _apply_error_pattern_prevention(self, alert: PreventionAlert):
        """应用错误模式预防措施"""
        common_errors = alert.metrics.error_types
        if common_errors:
            suggestions = [
                "🔍 错误模式分析:",
                f"1. 最常见错误: {max(common_errors, key=common_errors.get)}",
                "2. 针对性修复相关消息格式",
                "3. 加强特定类型的验证",
                "4. 实施模式特定的防护措施"
            ]
            for suggestion in suggestions:
                self.logger.info(suggestion)

    def _monitoring_loop(self):
        """监控循环"""
        while self.monitoring_active:
            try:
                # 每分钟检查一次
                time.sleep(60)

                if self.metrics_history:
                    self._periodic_health_check()

            except Exception as e:
                self.logger.error(f"❌ 监控循环错误: {e}")

    def _periodic_health_check(self):
        """定期健康检查"""
        if not self.metrics_history:
            return

        recent_metrics = list(self.metrics_history)[-10:]  # 最近10次交互

        # 检查趋势
        avg_risk = sum(m.risk_score for m in recent_metrics) / len(recent_metrics)
        if avg_risk > self.thresholds['risk_score_high']:
            self.logger.warning(f"📈 持续高风险状态: {avg_risk:.2f}")

        # 检查最近的警报频率
        recent_alerts = [a for a in self.alert_history
                        if a.timestamp > datetime.now() - timedelta(minutes=10)]
        if len(recent_alerts) > 5:
            self.logger.warning("🚨 警报频率过高，建议立即检查系统状态")

    def add_prevention_callback(self, callback: Callable):
        """添加预防回调"""
        self.prevention_callbacks.append(callback)

    def get_monitoring_summary(self) -> Dict[str, Any]:
        """获取监控摘要"""
        if not self.metrics_history:
            return {"status": "no_data"}

        recent_metrics = list(self.metrics_history)[-10:]
        recent_alerts = list(self.alert_history)[-5:]

        return {
            "monitoring_status": "active" if self.monitoring_active else "inactive",
            "interactions_tracked": len(self.metrics_history),
            "alerts_generated": len(self.alert_history),
            "average_risk_score": sum(m.risk_score for m in recent_metrics) / len(recent_metrics),
            "last_check": self.last_check_time.isoformat(),
            "recent_alerts": [
                {
                    "type": a.alert_type,
                    "severity": a.severity,
                    "message": a.message,
                    "timestamp": a.timestamp.isoformat()
                }
                for a in recent_alerts
            ]
        }

# 全局监控实例
_global_monitor: Optional[BMad422PreventionMonitor] = None

def get_global_monitor() -> BMad422PreventionMonitor:
    """获取全局监控实例"""
    global _global_monitor
    if _global_monitor is None:
        _global_monitor = BMad422PreventionMonitor()
    return _global_monitor

def record_api_interaction(messages: List[Dict[str, Any]],
                          issues_found: int = 0,
                          fixes_applied: int = 0,
                          error_types: Optional[Dict[str, int]] = None):
    """记录API交互（便捷函数）"""
    monitor = get_global_monitor()
    monitor.record_interaction(
        messages, issues_found, fixes_applied, error_types or {}
    )

def main():
    """主函数 - 演示监控系统"""
    print("🛡️ BMad 422错误预防监控系统启动")

    monitor = BMad422PreventionMonitor()

    # 模拟一些交互数据
    test_messages = [
        {"role": "user", "content": "测试消息"},
        {"role": "assistant", "content": "回复消息"}
    ]

    # 记录正常交互
    monitor.record_interaction(test_messages, 0, 0, {})

    # 记录高风险交互
    long_messages = test_messages * 250  # 模拟长对话
    error_types = {"tool_use_in_content": 1, "invalid_content_type": 2}
    monitor.record_interaction(long_messages, 5, 3, error_types)

    # 获取监控摘要
    summary = monitor.get_monitoring_summary()
    print(f"📊 监控摘要: {json.dumps(summary, indent=2, ensure_ascii=False)}")

    # 等待几秒看监控效果
    time.sleep(3)

    print("✅ 预防监控系统演示完成")

if __name__ == "__main__":
    main()