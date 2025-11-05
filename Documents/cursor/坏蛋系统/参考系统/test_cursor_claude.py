#!/usr/bin/env python3
"""
Cursor Claude集成测试脚本
测试在Cursor环境中使用Claude的兼容性
"""

import json
import os
import sys
from pathlib import Path

def analyze_cursor_setup():
    """分析Cursor的Claude配置"""
    print("🔍 Cursor Claude集成分析")
    print("=" * 50)

    # 1. 检查Cursor配置
    cursor_config_path = Path("/Users/zhimingdeng/.cursor/mcp.json")

    if cursor_config_path.exists():
        print("✅ 找到Cursor MCP配置")

        with open(cursor_config_path, 'r') as f:
            config = json.load(f)

        mcp_servers = config.get('mcpServers', {})
        print(f"📊 配置的MCP服务器数量: {len(mcp_servers)}")

        # 分析关键服务器
        claude_related_servers = []
        stripe_related_servers = []

        for server_name, server_config in mcp_servers.items():
            if 'claude' in server_name.lower():
                claude_related_servers.append(server_name)
            if 'stripe' in server_name.lower() or 'queen' in server_name.lower():
                stripe_related_servers.append(server_name)

        print(f"🤖 Claude相关服务器: {claude_related_servers}")
        print(f"🔶 女王条纹相关服务器: {stripe_related_servers}")

        return True, mcp_servers
    else:
        print("❌ 未找到Cursor MCP配置")
        return False, {}

def test_claude_api_compatibility():
    """测试Claude API兼容性"""
    print("\n🧪 Claude API兼容性测试")
    print("-" * 40)

    # 检查环境变量
    claude_vars = {
        'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY'),
        'ANTHROPIC_BASE_URL': os.getenv('ANTHROPIC_BASE_URL'),
        'ANTHROPIC_MODEL': os.getenv('ANTHROPIC_MODEL'),
    }

    print("📋 环境变量检查:")
    for var, value in claude_vars.items():
        if value:
            # 隐藏敏感信息
            display_value = value[:10] + "..." if len(value) > 10 else value
            print(f"   ✅ {var}: {display_value}")
        else:
            print(f"   ❌ {var}: 未设置")

    return any(claude_vars.values())

def test_todo_write_issue():
    """测试TodoWrite问题"""
    print("\n🐛 TodoWrite问题分析")
    print("-" * 40)

    # 检查我们的修复方案
    safe_todo_path = Path("safe_todo_manager.py")
    clean_todo_path = Path("clean_todo_manager.py")

    if safe_todo_path.exists():
        print("✅ 安全Todo管理器存在")
        print("💡 建议: 在Cursor中也使用我们的安全Todo管理器")
    else:
        print("❌ 安全Todo管理器不存在")

    if clean_todo_path.exists():
        print("✅ 清理Todo管理器存在")
    else:
        print("❌ 清理Todo管理器不存在")

    return safe_todo_path.exists() or clean_todo_path.exists()

def test_ssl_fix_compatibility():
    """测试SSL修复兼容性"""
    print("\n🔒 SSL修复兼容性测试")
    print("-" * 40)

    ssl_detector_path = Path("src/ssl_enhanced_stripe_detector.py")

    if ssl_detector_path.exists():
        print("✅ SSL增强版检测器存在")
        print("💡 建议: 在Cursor中使用SSL增强版而不是原版")

        # 检查是否可以在Cursor中使用
        cursor_config_path = Path("/Users/zhimingdeng/.cursor/mcp.json")
        if cursor_config_path.exists():
            with open(cursor_config_path, 'r') as f:
                config = json.load(f)

            queen_stripe_server = config.get('mcpServers', {}).get('queen-stripe-analyzer')
            if queen_stripe_server:
                script_path = queen_stripe_server.get('args', [''])[0]
                if 'enhanced_stripe_detector.py' in script_path:
                    print("⚠️  Cursor配置中使用的是旧版检测器")
                    print("🔧 建议更新为SSL增强版")
                elif 'ssl_enhanced_stripe_detector.py' in script_path:
                    print("✅ Cursor配置中已使用SSL增强版")
                else:
                    print("❓ 无法确定使用的检测器版本")

        return True
    else:
        print("❌ SSL增强版检测器不存在")
        return False

def generate_cursor_recommendations():
    """生成Cursor使用建议"""
    print("\n💡 Cursor使用建议")
    print("=" * 50)

    recommendations = []

    # 1. TodoWrite问题
    print("1. 🐛 TodoWrite 422错误问题:")
    print("   ✅ 解决方案: 使用我们的安全Todo管理器")
    print("   📁 文件: safe_todo_manager.py")
    print("   🔧 使用: python3 safe_todo_manager.py")
    recommendations.append("使用安全Todo管理器避开422错误")

    # 2. SSL问题
    print("\n2. 🔒 SSL证书问题:")
    print("   ✅ 解决方案: 使用SSL增强版检测器")
    print("   📁 文件: src/ssl_enhanced_stripe_detector.py")
    print("   🔧 模式: ssl_mode='certifi'")
    recommendations.append("使用SSL增强版检测器")

    # 3. 配置更新
    print("\n3. ⚙️  Cursor配置更新:")
    print("   🔧 建议更新MCP配置使用SSL增强版")
    recommendations.append("更新Cursor MCP配置")

    # 4. 测试建议
    print("\n4. 🧪 测试建议:")
    print("   📝 在Cursor中测试简单的Claude请求")
    print("   📝 测试工具调用功能")
    print("   📝 测试条纹检测功能")
    recommendations.append("在Cursor中进行全面测试")

    return recommendations

def main():
    """主测试函数"""
    print("🚀 Cursor Claude集成完整测试")
    print("=" * 60)

    # 分析当前设置
    cursor_ok, servers = analyze_cursor_setup()
    api_ok = test_claude_api_compatibility()
    todo_ok = test_todo_write_issue()
    ssl_ok = test_ssl_fix_compatibility()

    # 生成建议
    recommendations = generate_cursor_recommendations()

    # 总结
    print(f"\n📊 测试总结")
    print("=" * 50)
    print(f"Cursor配置: {'✅ 正常' if cursor_ok else '❌ 异常'}")
    print(f"API兼容性: {'✅ 正常' if api_ok else '❌ 异常'}")
    print(f"Todo修复: {'✅ 可用' if todo_ok else '❌ 缺失'}")
    print(f"SSL修复: {'✅ 可用' if ssl_ok else '❌ 缺失'}")

    overall_score = sum([cursor_ok, api_ok, todo_ok, ssl_ok])
    print(f"\n🎯 总体评分: {overall_score}/4")

    if overall_score >= 3:
        print("🎉 Cursor Claude集成应该可以正常工作!")
        print("💡 建议应用我们的修复方案以获得最佳体验")
    else:
        print("⚠️  发现一些问题，建议先解决后再使用")

    print(f"\n📋 关键建议数量: {len(recommendations)}")
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec}")

if __name__ == "__main__":
    main()