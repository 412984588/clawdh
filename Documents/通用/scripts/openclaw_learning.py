#!/usr/bin/env python3
"""
OpenClaw 学习优化引擎
记录事故日志，统计事故频率，生成改进建议

学习机制：
1. 记录每次事故到 INCIDENT_LOG.md
2. 统计每种故障类型的发生次数
3. 达到阈值（3次）后生成改进建议到 PROPOSALS.md
4. 帮助系统持续优化
"""
import os
import json
from datetime import datetime
from collections import defaultdict


class LearningEngine:
    """OpenClaw 学习优化引擎"""

    def __init__(self):
        """初始化学习引擎"""
        self.incident_log = "logs/INCIDENT_LOG.md"
        self.proposals_file = "logs/PROPOSALS.md"
        self.incident_count_file = "logs/incident_count.json"
        self.incident_count = defaultdict(int)
        self.threshold = 3  # 3次类似事故后生成建议

        # 确保日志目录存在
        os.makedirs("logs", exist_ok=True)

        # 加载历史事故统计
        self.load_incident_count()

        # 确保日志文件存在
        self.init_log_files()

    def init_log_files(self):
        """初始化日志文件（如果不存在）"""
        if not os.path.exists(self.incident_log):
            with open(self.incident_log, "w", encoding="utf-8") as f:
                f.write("# OpenClaw 事故日志\n\n")
                f.write("记录 OpenClaw 服务的所有事故和恢复情况\n\n")
                f.write("---\n\n")

        if not os.path.exists(self.proposals_file):
            with open(self.proposals_file, "w", encoding="utf-8") as f:
                f.write("# OpenClaw 改进建议\n\n")
                f.write("基于事故日志自动生成的系统改进建议\n\n")
                f.write("---\n\n")

    def load_incident_count(self):
        """加载历史事故统计"""
        if os.path.exists(self.incident_count_file):
            try:
                with open(self.incident_count_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for failure_type, count in data.items():
                        self.incident_count[failure_type] = count
                print(f"  已加载历史事故统计: {dict(self.incident_count)}")
            except Exception as e:
                print(f"  ⚠️ 加载事故统计失败: {e}")

    def save_incident_count(self):
        """保存事故统计"""
        try:
            with open(self.incident_count_file, "w", encoding="utf-8") as f:
                json.dump(dict(self.incident_count), f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"  ❌ 保存事故统计失败: {e}")

    def log_incident(self, failure_type: str, recovery_success: bool):
        """
        记录事故日志

        Args:
            failure_type: 故障类型标识
            recovery_success: 恢复是否成功
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        status = "✅ 恢复成功" if recovery_success else "❌ 恢复失败"

        # 故障类型中文映射
        failure_type_map = {
            "process_crash": "进程崩溃",
            "api_timeout": "API 超时",
            "config_error": "配置错误",
            "external_api_failure": "外部 API 故障",
            "log_errors_only": "日志错误",
            "unknown": "未知故障",
        }
        failure_type_cn = failure_type_map.get(failure_type, failure_type)

        log_entry = f"""
## [{timestamp}] - {failure_type_cn}

**状态**: {status}
**故障类型**: {failure_type_cn}
**故障代码**: `{failure_type}`
"""
        # 写入日志文件
        try:
            with open(self.incident_log, "a", encoding="utf-8") as f:
                f.write(log_entry)
            print(f"  ✅ 事故日志已记录: {failure_type_cn}")
        except Exception as e:
            print(f"  ❌ 记录事故日志失败: {e}")
            return

        # 统计事故次数
        self.incident_count[failure_type] += 1
        print(f"  当前事故统计: {failure_type} = {self.incident_count[failure_type]}次")

        # 保存统计
        self.save_incident_count()

        # 检查是否需要生成改进建议
        if self.incident_count[failure_type] >= self.threshold:
            self.generate_proposal(failure_type)

    def generate_proposal(self, failure_type: str):
        """
        生成改进建议

        Args:
            failure_type: 故障类型标识
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        count = self.incident_count[failure_type]

        # 故障类型中文映射
        failure_type_map = {
            "process_crash": "进程崩溃",
            "api_timeout": "API 超时",
            "config_error": "配置错误",
            "external_api_failure": "外部 API 故障",
            "log_errors_only": "日志错误",
            "unknown": "未知故障",
        }
        failure_type_cn = failure_type_map.get(failure_type, failure_type)

        # 针对故障类型生成具体建议
        proposals = {
            "process_crash": """
**可能原因**:
1. Gateway 进程内存溢出
2. 系统资源不足（CPU/内存）
3. 应用级异常导致崩溃
4. 依赖服务不可用

**建议方案**:
1. 增加系统资源监控（内存、CPU 使用率）
2. 配置自动重启策略（已实现）
3. 检查 Gateway 日志查找崩溃原因
4. 考虑增加 Gateway 进程内存限制
5. 升级 OpenClaw 到最新版本

**预期效果**: 减少进程崩溃频率
""",
            "api_timeout": """
**可能原因**:
1. Gateway 服务卡死或响应缓慢
2. 网络连接问题
3. 数据库查询超时
4. 外部 API 调用超时

**建议方案**:
1. 增加超时阈值（当前 30-120 秒）
2. 实施健康检查的更短周期
3. 检查数据库性能（索引、查询优化）
4. 网络连接池优化
5. 增加数据库连接池监控

**预期效果**: 减少 API 超时频率
""",
            "config_error": """
**可能原因**:
1. JSON 语法错误（缺少逗号、括号不匹配）
2. 配置文件手动编辑错误
3. 必需字段缺失
4. 版本升级后配置格式不兼容

**建议方案**:
1. 使用 JSON validator 自动检查配置语法
2. 配置修改前自动备份
3. 实施 schema validation（必需字段检查）
4. 配置文件版本控制
5. 添加配置迁移脚本（版本升级时）

**预期效果**: 减少配置错误频率
""",
            "external_api_failure": """
**可能原因**:
1. GLM/Kimi API 服务宕机
2. API 密钥配额用尽
3. 网络连接问题
4. API 端点变更

**建议方案**:
1. 配置多个 API provider（负载均衡）
2. 实施自动故障切换（暂未实现）
3. 增加 API 健康检查（独立监控）
4. 配置 API 密钥轮换策略
5. 监控 API 配额使用情况

**预期效果**: 减少外部 API 故障影响
""",
            "log_errors_only": """
**可能原因**:
1. 应用级 bug 导致错误日志
2. 日志级别配置不当（太多 INFO 级别）
3. 依赖服务异常
4. 用户请求触发边界情况

**建议方案**:
1. 分析错误日志模式，定位根本原因
2. 调整日志级别（减少噪音）
3. 修复应用级 bug（需要开发介入）
4. 增加输入验证和边界检查
5. 实施告警机制（关键错误立即通知）

**预期效果**: 减少应用错误频率
""",
            "unknown": """
**可能原因**:
1. 未覆盖的故障场景
2. 监控逻辑缺陷
3. 复杂的多重故障

**建议方案**:
1. 分析 unknown 故障的具体表现
2. 扩展监控覆盖场景
3. 增加更详细的诊断日志
4. 人工介入分析

**预期效果**: 识别并覆盖未知故障类型
""",
        }

        proposal_content = proposals.get(failure_type, "暂无具体建议")

        proposal = f"""

## [{timestamp}] - 改进建议: {failure_type_cn}

**触发条件**: {failure_type_cn} 事故已发生 {count} 次（阈值：{self.threshold}次）

**当前状态**: ⚠️ 需要人工介入优化

{proposal_content}

---
"""
        # 写入建议文件
        try:
            with open(self.proposals_file, "a", encoding="utf-8") as f:
                f.write(proposal)
            print(f"\n📝 已生成改进建议: {failure_type_cn}（已发生{count}次）")
            print(f"   建议文件: {self.proposals_file}")
        except Exception as e:
            print(f"  ❌ 生成改进建议失败: {e}")

    def get_statistics(self) -> dict:
        """
        获取事故统计信息

        Returns:
            dict: 事故统计字典
        """
        return {
            "total_incidents": sum(self.incident_count.values()),
            "by_type": dict(self.incident_count),
            "threshold": self.threshold,
            "needs_proposal": [
                ft
                for ft, count in self.incident_count.items()
                if count >= self.threshold
            ],
        }
