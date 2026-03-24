#!/usr/bin/env python3
"""
OpenClaw 学习优化引擎 - 已修复重构版

已修复：
1. generate_proposal() 中的列表渲染问题
2. 完善了模板加载和渲染逻辑
"""
import os
import json
from datetime import datetime
from collections import defaultdict
from pathlib import Path


class LearningEngine:
    """OpenClaw 学习优化引擎 - 已修复重构版"""

    def __init__(self):
        """初始化学习引擎"""
        # 获取脚本所在目录
        self.script_dir = os.path.dirname(os.path.abspath(__file__))

        self.incident_log = os.path.join(self.script_dir, "../logs/INCIDENT_LOG.md")
        self.proposals_file = os.path.join(self.script_dir, "../logs/PROPOSALS.md")
        self.incident_count_file = os.path.join(
            self.script_dir, "../logs/incident_count.json"
        )
        self.incident_count = defaultdict(int)
        self.threshold = 3  # 3次类似事故后生成建议
        self.templates_file = os.path.join(self.script_dir, "proposal_templates.json")

        # 确保日志目录存在
        os.makedirs(os.path.join(self.script_dir, "../logs"), exist_ok=True)

        # 加载历史事故统计
        self.load_incident_count()

        # 确保日志文件存在
        self.init_log_files()

        # 加载提案模板
        self.load_templates()

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

    def load_templates(self):
        """加载提案模板"""
        if os.path.exists(self.templates_file):
            try:
                with open(self.templates_file, "r", encoding="utf-8") as f:
                    self.templates = json.load(f)
                print(f"  已加载提案模板: {len(self.templates)} 种故障类型")
            except Exception as e:
                print(f"  ⚠️ 加载提案模板失败: {e}")
                self.templates = {}
        else:
            print(f"  ⚠️ 模板文件未找到: {self.templates_file}")
            self.templates = {}

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

        # 从模板获取内容
        template = self.templates.get(failure_type, {})
        if not template:
            print(f"  ⚠️ 未知故障类型: {failure_type}，无法生成详细建议")
            return

        proposal_title = template.get("title", failure_type_cn)

        # 格式化列表
        causes_text = "\n".join([f"- {c}" for c in template.get("possible_causes", [])])
        solutions_text = "\n".join([f"- {s}" for s in template.get("solutions", [])])
        expected_effect = template.get("expected_effect", "")

        proposal = f"""

## [{timestamp}] - 改进建议: {proposal_title}

**触发条件**: {failure_type_cn} 事故已发生 {count} 次（阈值：{self.threshold}次）

**当前状态**: ⚠️ 需要人工介入优化

**可能原因**:
{causes_text}

**建议方案**:
{solutions_text}

**预期效果**: {expected_effect}

---
"""
        # 写入建议文件
        try:
            with open(self.proposals_file, "a", encoding="utf-8") as f:
                f.write(proposal)
            print(f"\n📝 已生成改进建议: {failure_type_cn}（已发生{count}次）")
            print(f"   建议文件: {self.proposals_file}")

            # 生成建议后重置计数，避免重复生成
            self.incident_count[failure_type] = 0
            self.save_incident_count()
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


if __name__ == "__main__":
    # 仅用于测试
    print("Learning Engine 重构版 - 测试模式")
    engine = LearningEngine()
    print(f"统计信息: {engine.get_statistics()}")
