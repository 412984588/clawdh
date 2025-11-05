#!/usr/bin/env python3
"""
更新候选平台列表 - 移除无效平台并添加新的优质候选
"""

import json
import socket
from datetime import datetime
from pathlib import Path

def update_platform_candidates():
    """更新候选平台列表"""
    print("🔧 更新候选平台列表")
    print("=" * 60)

    # 读取现有的dialog_5agent_system.py文件
    system_file = Path(__file__).parent / "dialog_5agent_system.py"

    if not system_file.exists():
        print("❌ 找不到dialog_5agent_system.py文件")
        return

    with open(system_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 分析结果：需要移除的平台
    platforms_to_remove = [
        "payfast.co",      # DNS解析失败
        "quickpay.io",     # DNS解析失败
        "easypay.com",     # DNS解析失败
        "paypro.io",       # DNS解析失败
        "fast.com"         # 不是支付平台
    ]

    print(f"\n🗑️ 需要移除的无效平台 ({len(platforms_to_remove)}个):")
    for platform in platforms_to_remove:
        print(f"   - {platform}")

    # 新增的优质候选平台
    new_platforms = [
        # 现代支付平台
        "paddle.com",           # 现代化支付平台
        "lemonsqueezy.com",     # SaaS支付专家
        "gumroad.com",          # 数字产品支付
        "kajabi.com",           # 创作者经济
        "podia.com",            # 创作者平台
        "memberful.com",        # 会员支付

        # 传统支付处理器
        "2checkout.com",        # 经典支付处理器
        "payoneer.com",         # 全球支付
        "skrill.com",           # 数字钱包
        "neteller.com",         # 数字支付

        # 垂直行业支付
        "razorpay.com",         # 印度支付（全球扩展）
        "payu.com",             # 全球支付
        "ccavenue.com",         # 亚洲支付
        "checkout.com",         # 现代支付处理

        # 新兴支付技术
        "moonpay.com",          # 加密货币支付
        "ramp.network",         # 加密支付入门
        "transak.com",          # 加密购买
        "simplex.com",          # 加密支付

        # 发票和账单
        "waveapps.com",         # 免费发票
        "freshbooks.com",       # 会计软件
        "invoice2go.com",       # 移动发票

        # 预约和服务
        "calendly.com",         # 预约系统
        "acuityscheduling.com", # 预约支付
        "squareup.com/appointments", # Square预约

        # 市场平台
        "gumroad.com",          # 数字市场
        "etsy.com",             # 手工艺品市场
        "ebay.com",             # 拍卖平台

        # 订阅平台
        "substack.com",         # 新闻订阅
        "patreon.com",          # 创作者赞助
        "onlyfans.com",         # 内容订阅
    ]

    print(f"\n➕ 新增优质候选平台 ({len(new_platforms)}个):")
    for platform in new_platforms[:10]:  # 显示前10个
        print(f"   - {platform}")
    print(f"   ... 还有{len(new_platforms)-10}个平台")

    # 验证新平台的DNS
    print(f"\n🔍 验证新平台DNS解析...")
    verified_new_platforms = []

    for platform in new_platforms:
        try:
            ip = socket.gethostbyname(platform)
            verified_new_platforms.append(platform)
            print(f"   ✅ {platform} -> {ip}")
        except socket.gaierror:
            print(f"   ❌ {platform} -> DNS失败")

    print(f"\n📊 新平台验证结果: {len(verified_new_platforms)}/{len(new_platforms)} 平台有效")

    # 创建新的候选平台列表
    # 首先从原始内容中提取现有的候选平台
    import re

    # 查找new_payment_platform_candidates列表
    pattern = r'self\.new_payment_platform_candidates = \[(.*?)\]'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        original_candidates_str = match.group(1)
        # 提取平台名称（去掉引号和逗号）
        original_platforms = re.findall(r'"([^"]+)"', original_candidates_str)

        print(f"\n📚 原始候选平台数量: {len(original_platforms)}")

        # 移除无效平台
        remaining_platforms = []
        for platform in original_platforms:
            if platform not in platforms_to_remove:
                remaining_platforms.append(platform)

        print(f"🗑️ 移除后剩余: {len(remaining_platforms)}")

        # 添加新的有效平台
        final_platforms = remaining_platforms + verified_new_platforms
        final_platforms = list(set(final_platforms))  # 去重
        final_platforms.sort()  # 排序

        print(f"✨ 最终候选平台数量: {len(final_platforms)}")

        # 生成新的候选平台列表字符串
        new_candidates_str = ',\n        '.join([f'"{platform}"' for platform in final_platforms])
        new_platform_list = f"self.new_payment_platform_candidates = [\n        {new_candidates_str}\n    ]"

        # 更新文件内容
        updated_content = re.sub(
            pattern,
            new_platform_list,
            content,
            flags=re.DOTALL
        )

        # 备份原文件
        backup_file = system_file.with_suffix('.py.backup')
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n💾 原文件已备份: {backup_file}")

        # 写入更新内容
        with open(system_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        print(f"✅ 候选平台列表已更新")

        # 生成更新报告
        update_report = {
            'update_time': datetime.now().isoformat(),
            'removed_platforms': platforms_to_remove,
            'added_platforms': verified_new_platforms,
            'original_count': len(original_platforms),
            'removed_count': len(platforms_to_remove),
            'added_count': len(verified_new_platforms),
            'final_count': len(final_platforms),
            'final_platforms': final_platforms
        }

        # 保存更新报告
        report_path = Path(__file__).parent / "data" / f"platform_candidates_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(exist_ok=True)

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(update_report, f, ensure_ascii=False, indent=2)

        print(f"📊 更新报告已保存: {report_path}")

        return update_report

    else:
        print("❌ 无法在文件中找到候选平台列表")
        return None

def main():
    """主函数"""
    print("🚀 开始更新候选平台列表")
    print("目标: 移除无效平台，添加优质候选")

    result = update_platform_candidates()

    if result:
        print("\n🎉 候选平台列表更新完成！")
        print(f"   移除无效平台: {len(result['removed_platforms'])}个")
        print(f"   新增优质平台: {len(result['added_platforms'])}个")
        print(f"   最终平台总数: {len(result['final_platforms'])}个")
        print("\n💡 下一步建议:")
        print("   1. 测试更新后的系统性能")
        print("   2. 监控新平台的验证成功率")
        print("   3. 持续优化候选平台质量")
    else:
        print("\n❌ 更新失败，请检查文件格式")

if __name__ == "__main__":
    main()