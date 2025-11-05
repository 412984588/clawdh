#!/usr/bin/env python3
"""
添加域名预检查机制到dialog_5agent_system.py
"""

import socket
from pathlib import Path
import re

def add_domain_precheck():
    """添加域名预检查功能"""
    print("🔧 添加域名预检查机制")
    print("=" * 60)

    # 读取更新后的dialog_5agent_system.py文件
    system_file = Path(__file__).parent / "dialog_5agent_system.py"

    with open(system_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 要添加的域名预检查方法
    domain_precheck_method = '''
    def _precheck_platform_domain(self, platform: str) -> dict:
        """预检查平台域名可用性"""
        try:
            # DNS解析检查
            ip = socket.gethostbyname(platform)

            # 基本分类
            platform_info = {
                'domain': platform,
                'dns_status': 'success',
                'ip_address': ip,
                'platform_type': self._classify_platform_type(platform),
                'is_valid_candidate': True
            }

            # 检查是否为已知的非支付平台
            if platform in ['fast.com', 'google.com', 'facebook.com']:
                platform_info['is_valid_candidate'] = False
                platform_info['rejection_reason'] = '不是支付平台'

            return platform_info

        except socket.gaierror:
            return {
                'domain': platform,
                'dns_status': 'failed',
                'ip_address': None,
                'platform_type': 'unknown',
                'is_valid_candidate': False,
                'rejection_reason': '域名不存在或无法解析'
            }

    def _classify_platform_type(self, platform: str) -> str:
        """简单分类平台类型"""
        platform_lower = platform.lower()

        payment_keywords = ['pay', 'payment', 'checkout', 'billing', 'invoice', 'stripe', 'paypal']
        commerce_keywords = ['shop', 'store', 'market', 'sell', 'buy', 'ecommerce']
        creator_keywords = ['member', 'patron', 'creator', 'kajabi', 'podia', 'gumroad']
        service_keywords = ['booking', 'appointment', 'schedule', 'calendly']

        if any(keyword in platform_lower for keyword in payment_keywords):
            return 'payment_platform'
        elif any(keyword in platform_lower for keyword in commerce_keywords):
            return 'commerce_platform'
        elif any(keyword in platform_lower for keyword in creator_keywords):
            return 'creator_platform'
        elif any(keyword in platform_lower for keyword in service_keywords):
            return 'service_platform'
        else:
            return 'general_platform'

    def _filter_valid_platforms(self, platforms: list) -> list:
        """过滤有效的平台候选"""
        valid_platforms = []
        invalid_count = 0

        print(f"   🔍 预检查 {len(platforms)} 个平台域名...")

        for platform in platforms:
            platform_info = self._precheck_platform_domain(platform)

            if platform_info['is_valid_candidate']:
                valid_platforms.append(platform)
                print(f"   ✅ {platform} -> {platform_info['platform_type']}")
            else:
                invalid_count += 1
                print(f"   ❌ {platform} -> {platform_info.get('rejection_reason', '无效域名')}")

        print(f"   📊 预检查结果: {len(valid_platforms)}/{len(platforms)} 平台有效 (移除 {invalid_count} 个)")

        return valid_platforms
'''

    # 找到类的合适位置插入新方法（在__init__方法之后）
    init_pattern = r'(def __init__\(self\):.*?print\("🔹 VA已启用AA反馈学习模式"\")'
    init_match = re.search(init_pattern, content, re.DOTALL)

    if init_match:
        # 在__init__方法后添加新方法
        insertion_point = init_match.end()
        new_content = content[:insertion_point] + domain_precheck_method + content[insertion_point:]

        # 保存到文件
        backup_file = system_file.with_suffix('.py.backup2')
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"💾 第二次备份已保存: {backup_file}")

        with open(system_file, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print("✅ 域名预检查方法已添加")

        # 更新search_new_payment_platforms方法以使用预检查
        return update_search_method_with_precheck(system_file)

    else:
        print("❌ 无法找到__init__方法，无法添加预检查功能")
        return False

def update_search_method_with_precheck(system_file: Path) -> bool:
    """更新search_new_payment_platforms方法以使用域名预检查"""
    print("\n🔧 更新平台搜索方法以使用域名预检查")

    with open(system_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 找到search_new_payment_platforms方法
    search_method_pattern = r'(def search_new_payment_platforms\(self\):.*?)(# 应用AA反馈学习)'
    search_match = re.search(search_method_pattern, content, re.DOTALL)

    if search_match:
        method_start = search_match.group(1)
        method_end = search_match.group(2)

        # 添加域名预检查逻辑
        precheck_logic = '''
        # Phase 1: 域名预检查
        print("   🔍 域名预检查阶段...")
        valid_candidates = self._filter_valid_platforms(self.new_payment_platform_candidates)

        # Phase 2: 过滤已验证平台
        print("   🗑️ 过滤已验证平台...")
        new_candidates = []

        for platform in valid_candidates:
            if platform.lower() not in self.verified_platforms_database:
                new_candidates.append(platform)
                print(f"   ✅ 新候选: {platform}")
            else:
                print(f"   ⏭️ 已验证，跳过: {platform}")

        if not new_candidates:
            print("   ℹ️ 无新平台可发现，扩展候选池...")
            return []

        # Phase 3: 智能选择候选平台
        print("   🎯 智能候选选择...")
        selected_platforms = self._select_platforms_intelligently(new_candidates, 5)

        print(f"   📊 选择 {len(selected_platforms)} 个平台进行验证:")
        for i, platform in enumerate(selected_platforms, 1):
            print(f"      {i}. {platform}")

        # Phase 4: 应用AA反馈学习
'''

        # 构建新的方法内容
        new_search_method = method_start + precheck_logic + method_end

        # 替换原方法
        updated_content = re.sub(
            search_method_pattern,
            new_search_method,
            content,
            flags=re.DOTALL
        )

        # 添加智能选择方法
        intelligent_selection_method = '''

    def _select_platforms_intelligently(self, platforms: list, count: int) -> list:
        """智能选择候选平台"""
        if len(platforms) <= count:
            return platforms

        # 按平台类型分类
        payment_platforms = []
        commerce_platforms = []
        creator_platforms = []
        service_platforms = []
        other_platforms = []

        for platform in platforms:
            platform_type = self._classify_platform_type(platform)
            if platform_type == 'payment_platform':
                payment_platforms.append(platform)
            elif platform_type == 'commerce_platform':
                commerce_platforms.append(platform)
            elif platform_type == 'creator_platform':
                creator_platforms.append(platform)
            elif platform_type == 'service_platform':
                service_platforms.append(platform)
            else:
                other_platforms.append(platform)

        # 优先选择支付平台
        selected = []

        # 优先级: 支付平台 > 创作者平台 > 电商平台 > 服务平台 > 其他
        priority_lists = [
            payment_platforms,
            creator_platforms,
            commerce_platforms,
            service_platforms,
            other_platforms
        ]

        for priority_list in priority_lists:
            if len(selected) < count:
                remaining = count - len(selected)
                take = min(remaining, len(priority_list))
                selected.extend(priority_list[:take])

        return selected[:count]
'''

        # 在文件末尾添加智能选择方法（在最后一个方法之后）
        last_method_pattern = r'(def _select_platforms_intelligently\(.*?\n        return selected\[:count\])'
        if not re.search(last_method_pattern, updated_content, re.DOTALL):
            updated_content += intelligent_selection_method

        # 保存文件
        with open(system_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        print("✅ 搜索方法已更新，支持域名预检查和智能选择")
        return True

    else:
        print("❌ 无法找到search_new_payment_platforms方法")
        return False

def main():
    """主函数"""
    print("🚀 开始添加域名预检查机制")
    print("目标: 提高系统效率，避免浪费时间在无效域名上")

    success = add_domain_precheck()

    if success:
        print("\n🎉 域名预检查机制添加完成！")
        print("✨ 新功能:")
        print("   - DNS预检查: 自动过滤无效域名")
        print("   - 平台分类: 智能识别平台类型")
        print("   - 候选优化: 优先选择支付相关平台")
        print("   - 效率提升: 减少无效验证尝试")
        print("\n💡 下一步:")
        print("   1. 测试更新后的系统性能")
        print("   2. 监控预检查效果")
        print("   3. 根据结果进一步优化")
    else:
        print("\n❌ 添加失败，请检查代码")

if __name__ == "__main__":
    main()