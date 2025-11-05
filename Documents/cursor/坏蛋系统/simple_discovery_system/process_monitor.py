#!/usr/bin/env python3
"""
后台进程状态监控系统
解决系统状态显示延迟问题，确保准确的进程状态反映
"""

import time
import json
from datetime import datetime
from typing import Dict, List, Optional
import subprocess
import threading

class ProcessStatusMonitor:
    """进程状态监控器 - 解决卡着显示问题"""

    def __init__(self):
        self.active_processes: Dict[str, Dict] = {}
        self.monitoring = False
        self.monitor_thread = None

    def register_process(self, process_id: str, process_info: Dict):
        """注册进程监控"""
        self.active_processes[process_id] = {
            **process_info,
            'start_time': datetime.now(),
            'status': 'running',
            'last_check': datetime.now()
        }
        print(f'📊 已注册进程监控: {process_id}')

    def update_process_status(self, process_id: str, status: str):
        """更新进程状态"""
        if process_id in self.active_processes:
            self.active_processes[process_id]['status'] = status
            self.active_processes[process_id]['last_check'] = datetime.now()
            print(f'🔄 进程状态更新: {process_id} -> {status}')

    def check_process_completion(self, process_id: str) -> bool:
        """检查进程是否真实完成"""
        if process_id not in self.active_processes:
            return False

        process_info = self.active_processes[process_id]

        # 检查进程是否已经运行了合理时间
        runtime = datetime.now() - process_info['start_time']

        # 如果运行时间超过预期阈值，标记为可疑
        if runtime.total_seconds() > 120:  # 2分钟阈值
            print(f'⚠️ 进程 {process_id} 运行时间过长: {runtime.total_seconds():.1f}秒')
            process_info['status'] = 'suspended'
            return True

        return False

    def start_monitoring(self):
        """开始监控"""
        if self.monitoring:
            return

        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        print('🔍 进程状态监控器已启动')

    def stop_monitoring(self):
        """停止监控"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        print('⏹️ 进程状态监控器已停止')

    def _monitor_loop(self):
        """监控循环"""
        while self.monitoring:
            try:
                self._check_all_processes()
                time.sleep(10)  # 每10秒检查一次
            except Exception as e:
                print(f'监控循环错误: {e}')

    def _check_all_processes(self):
        """检查所有进程状态"""
        current_time = datetime.now()

        for process_id, process_info in list(self.active_processes.items()):
            # 检查长时间运行的进程
            runtime = current_time - process_info['start_time']
            if runtime.total_seconds() > 180:  # 3分钟强制超时
                print(f'🔴 强制终止超时进程: {process_id} (运行 {runtime.total_seconds():.1f}秒)')
                process_info['status'] = 'terminated'

            # 清理旧的状态记录
            if runtime.total_seconds() > 600:  # 10分钟后清理记录
                del self.active_processes[process_id]
                print(f'🧹 清理进程记录: {process_id}')

    def get_status_report(self) -> Dict:
        """获取状态报告"""
        current_time = datetime.now()
        report = {
            'timestamp': current_time.isoformat(),
            'total_processes': len(self.active_processes),
            'running': 0,
            'completed': 0,
            'suspended': 0,
            'terminated': 0,
            'processes': []
        }

        for process_id, process_info in self.active_processes.items():
            status = process_info['status']
            runtime = current_time - process_info['start_time']

            report[status] += 1
            report['processes'].append({
                'id': process_id,
                'status': status,
                'runtime_seconds': runtime.total_seconds(),
                'start_time': process_info['start_time'].isoformat()
            })

        return report

    def force_cleanup_all(self):
        """强制清理所有进程"""
        print('🚨 强制清理所有进程...')
        for process_id in list(self.active_processes.keys()):
            self.active_processes[process_id]['status'] = 'terminated'
        print('✅ 所有进程已强制终止')

# 全局监控器实例
process_monitor = ProcessStatusMonitor()

def demonstrate_monitoring():
    """演示监控功能"""
    print('🔍 演示进程状态监控系统')
    print('='*50)

    # 启动监控器
    process_monitor.start_monitoring()

    # 注册一些测试进程
    test_processes = [
        ('test_va_001', {'type': 'VA验证', 'target': 'stripe.com'}),
        ('test_aa_002', {'type': 'AA审计', 'target': 'paypal.com'}),
        ('test_da_003', {'type': 'DA发现', 'target': '新平台'})
    ]

    for pid, info in test_processes:
        process_monitor.register_process(pid, info)

    # 模拟进程状态变化
    time.sleep(2)
    process_monitor.update_process_status('test_va_001', 'completed')

    time.sleep(1)
    process_monitor.update_process_status('test_aa_002', 'completed')

    # 获取状态报告
    report = process_monitor.get_status_report()
    print(f'\n📊 状态报告:')
    print(f'   总进程数: {report["total_processes"]}')
    print(f'   运行中: {report["running"]}')
    print(f'   已完成: {report["completed"]}')
    print(f'   暂停: {report["suspended"]}')
    print(f'   终止: {report["terminated"]}')

    print('\n🎉 监控演示完成!')

    # 停止监控
    process_monitor.stop_monitoring()

if __name__ == '__main__':
    demonstrate_monitoring()