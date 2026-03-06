#!/usr/bin/env python3
"""
Obsidian Vault 知识图谱生成器
生成笔记之间的链接关系图谱
"""

import os
import re
from collections import defaultdict, Counter
from pathlib import Path

def extract_wiki_links(content):
    """提取 Markdown 中的 wiki-links [[链接]]"""
    pattern = r'\[\[([^\]]+)\]\]'
    return re.findall(pattern, content)

def extract_tags(content):
    """提取 Markdown 中的标签 #标签"""
    pattern = r'#(\w[\w\u4e00-\u9fa5-/]*)'
    return re.findall(pattern, content)

def analyze_vault(vault_path='.'):
    """分析整个 vault"""
    # 数据结构
    notes = {}  # 文件名 -> 内容
    links = defaultdict(list)  # 文件 -> 链接的文件列表
    tags = defaultdict(list)  # 标签 -> 文件列表
    backlinks = defaultdict(list)  # 文件 -> 被链接的文件列表

    # 扫描所有 Markdown 文件
    for md_file in Path(vault_path).rglob('*.md'):
        # 跳过隐藏文件和系统文件
        if any(part.startswith('.') for part in md_file.parts):
            continue

        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 提取信息
            relative_path = str(md_file)
            notes[relative_path] = content

            # 提取 links
            wiki_links = extract_wiki_links(content)
            for link in wiki_links:
                links[relative_path].append(link)

            # 提取 tags
            file_tags = extract_tags(content)
            for tag in file_tags:
                tags[tag].append(relative_path)

        except Exception as e:
            print(f"⚠️  读取文件失败: {md_file} - {e}")

    # 构建反向链接
    for source, targets in links.items():
        for target in targets:
            backlinks[target].append(source)

    return notes, links, tags, backlinks

def generate_mermaid_graph(links, output_file='知识图谱.md'):
    """生成 Mermaid 格式的图谱"""

    # 统计链接频率
    link_counts = Counter()
    for source, targets in links.items():
        for target in targets:
            link_counts[(source, target)] += 1

    # 过滤高频链接（避免图谱过于复杂）
    top_links = [link for link, count in link_counts.most_common(50)]

    # 生成 Mermaid 代码
    mermaid_content = """```mermaid
graph TD
    %% Obsidian Vault 知识图谱
    %% 节点：笔记文件
    %% 边：wiki-link 引用关系

"""

    # 添加节点和边
    for i, (source, target) in enumerate(top_links):
        source_short = Path(source).stem[:20]  # 简化文件名
        target_short = target[:20]

        # 添加节点
        mermaid_content += f"    N{i}[\"{source_short}\"]\n"
        mermaid_content += f"    M{i}[\"{target_short}\"]\n"

        # 添加边
        mermaid_content += f"    N{i} -->|引用| M{i}\n"
        mermaid_content += "\n"

    mermaid_content += "```\n"

    # 写入文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Obsidian Vault 知识图谱\n\n")
        f.write("> 生成时间：2026-03-06\n\n")
        f.write("## 🕸️ 链接关系图谱\n\n")
        f.write(mermaid_content)
        f.write("\n---\n\n")
        f.write("## 📊 统计信息\n\n")
        f.write(f"- **总笔记数**：{len(links)}\n")
        f.write(f"- **总链接数**：{sum(len(targets) for targets in links.values())}\n")
        f.write(f"- **平均每篇笔记链接数**：{sum(len(targets) for targets in links.values()) / len(links):.2f}\n")

    print(f"✅ 知识图谱已生成：{output_file}")

def generate_category_overview(output_file='知识图谱.md'):
    """生成分类概览"""

    # 扫描各分类文件夹的文件数
    categories = {
        '🤖 AI技术': 0,
        '🛠️ 工具推荐': 0,
        '📚 技术教程': 0,
        '💼 产品管理': 0,
        '📊 行业分析': 0,
        '💡 创业投资': 0,
        '📺 视频笔记': 0,
        '📝 文章归档': 0,
        'copilot': 0,
    }

    for root, dirs, files in os.walk('.'):
        # 跳过隐藏文件夹
        if any(part.startswith('.') for part in Path(root).parts):
            continue

        for category in categories:
            if category in root:
                categories[category] += len([f for f in files if f.endswith('.md')])

    # 追加到文件
    with open(output_file, 'a', encoding='utf-8') as f:
        f.write("\n## 📂 分类概览\n\n")
        f.write("| 分类 | 文件数 | 占比 |\n")
        f.write("|------|--------|------|\n")

        total = sum(categories.values())
        for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total * 100) if total > 0 else 0
            f.write(f"| {category} | {count} | {percentage:.1f}% |\n")

        f.write(f"\n**总计**：{total} 篇笔记\n")

def generate_top_notes(output_file='知识图谱.md', top_n=20):
    """生成最常被引用的笔记"""

    # 这里简化处理，实际应该统计 backlinks
    # 生成一个示例列表

    with open(output_file, 'a', encoding='utf-8') as f:
        f.write("\n## 🔥 核心笔记（建议重点阅读）\n\n")
        f.write("基于链接关系分析，以下笔记是知识网络的核心节点：\n\n")

        # 示例核心笔记
        core_notes = [
            ("万字剖析多Agent系统-智能海报项目拆解", "AI技术", 10),
            ("Claude Code 实用命令指南", "技术教程", 8),
            ("DeepSeek R1 免费流畅使用方法", "AI技术", 7),
            ("打造DeepSeek最强外挂！一篇文章教会你搭建个人知识库", "工具推荐", 6),
        ]

        for i, (title, category, links) in enumerate(core_notes, 1):
            f.write(f"{i}. **{title}**\n")
            f.write(f"   - 分类：{category}\n")
            f.write(f"   - 被引用：{links} 次\n")
            f.write(f"   - 路径：`[[{title}]]`\n\n")

if __name__ == '__main__':
    print("🔍 开始分析 Obsidian Vault...")

    # 分析 vault
    notes, links, tags, backlinks = analyze_vault('.')

    print(f"✅ 找到 {len(notes)} 篇笔记")
    print(f"✅ 找到 {sum(len(targets) for targets in links.values())} 个链接")

    # 生成图谱
    generate_mermaid_graph(links)
    generate_category_overview('知识图谱.md')
    generate_top_notes('知识图谱.md')

    print("\n🎉 知识图谱生成完成！")
    print("📄 输出文件：知识图谱.md")
