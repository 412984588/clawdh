#!/usr/bin/env python3
"""
🔄 无限循环AA架构系统 - 对话实时显示版本
100%真实验证，持续发现新支付平台
"""

import json
import time
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import sys

class InfiniteDialogAASystem:
    """🔄 无限循环对话AA架构系统"""

    def __init__(self):
        # 复用dialog_5agent_system的核心类
        sys.path.append(str(Path(__file__).parent))
        from dialog_5agent_system import DialogDADataDiscoveryExpert, DialogVAVerificationExpert, DialogAAAuditAllocator

        self.da = DialogDADataDiscoveryExpert()
        self.va = DialogVAVerificationExpert()
        self.aa = DialogAAAuditAllocator()

        self.cycle_number = 1
        self.is_running = True

        # 统计数据
        self.total_discovered = 0
        self.total_approved = 0

        print("🚀 启动无限循环AA架构系统")
        print("⚠️ 100%真实运行 + 智能去重 + 动态突破访问限制")
        print("🌐 每个平台都会进行真实网络请求和内容分析")
        print("🛡️ 您的AA架构确保只有真正的支付平台通过验证")
        print("🔄 系统将无限循环运行，持续发现新平台")
        print("💬 您现在可以在对话中实时看到Agent工作状态")
        print("=" * 80)

    def run_infinite_cycle(self):
        """运行无限循环"""
        print("🔄 开始无限循环AA架构发现...")

        try:
            while self.is_running:
                print(f"\n{'='*80}")
                print(f"🚀 无限循环AA架构第 {self.cycle_number} 轮工作循环开始")
                print(f"📊 累计统计: 已发现 {self.total_discovered} 个，已批准 {self.total_approved} 个")
                print(f"⏰ 开始时间: {datetime.now().strftime('%H:%M:%S')}")
                print("="*80)

                try:
                    # Phase 1: DA数据发现
                    print(f"\n🟢 Phase 1: DA数据发现 (智能去重)")
                    discovered_platforms = self.da.search_new_payment_platforms()

                    if not discovered_platforms:
                        print("❌ DA未发现新平台，等待30秒后重试...")
                        time.sleep(30)
                        continue

                    self.total_discovered += len(discovered_platforms)

                    # Phase 2: VA验证分析
                    print(f"\n🟡 Phase 2: VA验证分析 (动态突破访问限制 + 严格4项验证 + AA-VA反馈学习)")

                    # VA获取AA的学习数据
                    self.va.set_aa_learning_data(self.aa.va_learning_data)

                    def va_progress(current, total, detail):
                        pass  # 简化版本，不显示过多进度

                    va_results = self.va.verify_platforms_real(discovered_platforms, va_progress)

                    if not va_results:
                        print("❌ VA无验证结果，等待30秒后重试...")
                        time.sleep(30)
                        continue

                    # Phase 3: AA质量审计
                    print(f"\n🔴 Phase 3: AA质量审计 + 全循环反馈学习 (您的关键AA架构)")

                    def aa_progress(current, total, detail):
                        pass  # 简化版本

                    aa_approved = self.aa.audit_real_results(va_results, aa_progress)
                    self.total_approved += len(aa_approved)

                    # Phase 4: DA反馈学习
                    print(f"\n🔵 Phase 4: DA接收AA-VA反馈学习")

                    # 计算成功率并提供反馈给DA
                    success_rate = len(aa_approved) / max(1, len(va_results)) if va_results else 0

                    if aa_approved:
                        # 记录成功模式给DA + 标记为已验证
                        for platform in aa_approved:
                            success_feedback = {
                                'platform_name': platform['platform_name'],
                                'feedback_type': 'successful_pattern',
                                'reason': 'AA批准的成功案例'
                            }
                            self.da.process_aa_va_feedback(success_feedback)

                            # 🔑 关键修复：将AA批准的平台标记为已验证
                            self.da._mark_platform_as_verified(platform['platform_name'])

                    # 如果成功率低，提供整体策略反馈
                    if success_rate < 0.2:
                        print(f"   🧠 DA反馈: 整体成功率较低({success_rate:.1%})，需要改进搜索策略")
                        da_feedback = {
                            'cycle_number': self.cycle_number,
                            'success_rate': success_rate,
                            'total_candidates': len(discovered_platforms),
                            'va_verified': len(va_results),
                            'aa_approved': len(aa_approved),
                            'feedback_type': 'low_success_rate'
                        }
                        self.da.process_aa_va_feedback(da_feedback)

                    # 显示本轮结果
                    print(f"\n📋 第 {self.cycle_number} 轮最终结果:")
                    print("="*80)
                    if aa_approved:
                        print("✨ 通过AA审计的新支付平台:")
                        for i, platform in enumerate(aa_approved, 1):
                            print(f"   🆕 {i}. {platform['platform_name']} [第{self.cycle_number}轮发现]")
                            print(f"      AA分数: {platform['aa_score']}/100")
                            print(f"      审计原因: {platform['reason']}")
                    else:
                        print("⚠️ 本轮未发现符合AA标准的新平台")

                    print("="*80)
                    print(f"🎉 第 {self.cycle_number} 轮工作循环完成！")
                    print(f"📊 累计统计: 总发现 {self.total_discovered} 个，总批准 {self.total_approved} 个")
                    print(f"📈 本轮通过率: {len(aa_approved)}/{len(discovered_platforms)} ({len(aa_approved)/len(discovered_platforms)*100:.1f}%)")

                    # 保存本轮结果
                    if aa_approved:
                        self._save_cycle_results(aa_approved)

                    # 等待间隔后开始下一轮
                    print(f"\n⏳ 等待30秒后开始第 {self.cycle_number + 1} 轮...")
                    time.sleep(30)

                    self.cycle_number += 1

                except Exception as e:
                    print(f"❌ 第 {self.cycle_number} 轮执行错误: {e}")
                    print("🔄 系统将在30秒后继续...")
                    time.sleep(30)
                    self.cycle_number += 1

        except KeyboardInterrupt:
            print(f"\n\n🛑 用户中断无限循环")
            print(f"📊 最终统计:")
            print(f"   总运行轮数: {self.cycle_number}")
            print(f"   总发现平台: {self.total_discovered}")
            print(f"   总批准平台: {self.total_approved}")
            if self.total_discovered > 0:
                print(f"   最终通过率: {self.total_approved / self.total_discovered * 100:.1f}%")
            print("🙏 感谢使用无限循环AA架构系统！")
        except Exception as e:
            print(f"\n❌ 系统错误: {e}")
            print(f"📊 已完成 {self.cycle_number} 轮循环")
            print("🔄 系统将尝试重启...")

    def _save_cycle_results(self, approved_platforms: List[Dict]):
        """保存轮次结果"""
        try:
            cycle_data = {
                'cycle_number': self.cycle_number,
                'cycle_timestamp': datetime.now().isoformat(),
                'approved_platforms': approved_platforms,
                'total_approved_this_cycle': len(approved_platforms),
                'cumulative_approved': self.total_approved,
                'coordinator': 'InfiniteDialogAA-System',
                'discovery_type': 'INFINITIE_AA_DISCOVERY'
            }

            # 保存到文件
            filename = f"data/infinite_dialog_results/cycle_{self.cycle_number}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            data_path = Path(__file__).parent / "data" / "infinite_dialog_results"
            data_path.mkdir(exist_ok=True)

            with open(data_path / filename.split('/')[-1], 'w', encoding='utf-8') as f:
                json.dump(cycle_data, f, ensure_ascii=False, indent=2)

            print(f"💾 轮次结果已保存: {filename}")
        except Exception as e:
            print(f"⚠️ 保存结果失败: {e}")

def main():
    """主函数"""
    system = InfiniteDialogAASystem()
    system.run_infinite_cycle()

if __name__ == "__main__":
    main()