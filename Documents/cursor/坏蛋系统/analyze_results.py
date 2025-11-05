#!/usr/bin/env python3
import json

# 分析验证结果
def analyze_validation_results():
    try:
        with open('real_validation_results.json', 'r', encoding='utf-8') as f:
            results = json.load(f)
    except:
        print("❌ 无法读取验证结果文件")
        return

    print("🎯 验证结果分析")
    print("=" * 50)

    total_platforms = len(results)
    passed_platforms = []
    failed_platforms = []

    for name, result in results.items():
        if result.get('overall', False):
            passed_platforms.append({
                'name': name,
                'domain': result.get('domain', ''),
                'type': result.get('type', ''),
                'summary': result.get('summary', '')
            })
        else:
            failed_platforms.append({
                'name': name,
                'domain': result.get('domain', ''),
                'summary': result.get('summary', ''),
                'details': result.get('details', [])
            })

    print(f"📊 总体统计:")
    print(f"  🔍 总验证平台: {total_platforms}")
    print(f"  ✅ 通过平台: {len(passed_platforms)}")
    print(f"  ❌ 未通过平台: {len(failed_platforms)}")
    print(f"  📈 通过率: {len(passed_platforms)/total_platforms*100:.1f}%")

    print("\n🏆 通过4项验证的平台:")
    for i, platform in enumerate(passed_platforms, 1):
        print(f"  {i:2d}. {platform['name']} ({platform['domain']}) - {platform['type']}")

    print(f"\n❌ 未完全通过的平台:")
    for i, platform in enumerate(failed_platforms, 1):
        print(f"  {i:2d}. {platform['name']} ({platform['domain']}) - {platform['summary']}")
        if platform.get('details'):
            print(f"       详情: {', '.join(platform['details'])}")

    # 按类型统计通过平台
    type_stats = {}
    for platform in passed_platforms:
        ptype = platform['type']
        if ptype not in type_stats:
            type_stats[ptype] = 0
        type_stats[ptype] += 1

    print(f"\n📋 按类型统计通过平台:")
    for ptype, count in sorted(type_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ptype}: {count} 个")

    return passed_platforms, failed_platforms

if __name__ == "__main__":
    analyze_validation_results()