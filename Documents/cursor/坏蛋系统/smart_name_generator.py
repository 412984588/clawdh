#!/usr/bin/env python3
"""
智能平台名称生成器
生成更自然、更有意义的平台名称
"""

import json
import random
from typing import List, Tuple

class SmartNameGenerator:
    def __init__(self):
        # 有意义的词汇库
        self.core_words = {
            "payment": ["pay", "tip", "fund", "donate", "support", "back", "sponsor"],
            "creator": ["creator", "artist", "maker", "writer", "developer", "designer"],
            "platform": ["hub", "spot", "place", "zone", "space", "site", "page"],
            "action": ["get", "go", "join", "start", "launch", "begin", "use"],
            "money": ["cash", "coin", "credit", "wallet", "bank", "purse"],
            "community": ["fans", "followers", "supporters", "patrons", "backers"],
            "content": ["content", "work", "art", "music", "video", "post"],
            "reward": ["reward", "prize", "gift", "perk", "bonus", "treat"],
            "easy": ["easy", "simple", "quick", "fast", "smart", "instant"],
            "pro": ["pro", "plus", "max", "ultra", "super", "premium"]
        }

        # 真实平台命名模式
        self.name_patterns = [
            # 动词 + 名词
            ["action", "payment"],
            ["action", "creator"],
            ["action", "platform"],

            # 形容词 + 名词
            ["easy", "payment"],
            ["smart", "creator"],
            ["pro", "platform"],

            # 名词 + 名词
            ["payment", "platform"],
            ["creator", "hub"],
            ["money", "spot"],

            # 复合词
            ["payment", "action"],
            ["creator", "payment"],
            ["community", "fund"],

            # 单字
            ["payment"],
            ["creator"],
            ["platform"],
            ["action"]
        ]

        # 后缀
        self.suffixes = ["", "ly", "ify", "io", "co", "app", "now", "go", "up"]

        # 成功的真实平台名（用作参考）
        self.reference_names = [
            "patreon", "ko-fi", "buymeacoffee", "gumroad", "substack",
            "paypal", "stripe", "venmo", "cashapp", "zelle",
            "kickstarter", "indiegogo", "gofundme", "fundly",
            "onlyfans", "fansly", "subscribestar", "memberful"
        ]

    def generate_meaningful_names(self, count: int = 100) -> List[Tuple[str, str, List[str]]]:
        """
        生成有意义的平台名称
        返回: [(name, domain, types)]
        """
        names = []

        # 基于模式的生成
        for pattern in self.name_patterns:
            if len(names) >= count:
                break

            # 为模式中的每个类别选词
            words = []
            for category in pattern:
                word = random.choice(self.core_words.get(category, [""]))
                words.append(word)

            # 组合名称
            name = self.combine_words(words)
            if name and len(name) >= 4:
                domain = name + ".com"
                types = self.infer_types(pattern)
                names.append((name, domain, types))

        # 变形生成
        while len(names) < count:
            # 随机选择一个参考名称进行变形
            ref = random.choice(self.reference_names)
            variation = self.create_variation(ref)
            if variation and len(variation) >= 4:
                domain = variation + ".com"
                types = self.infer_types_from_name(variation)
                names.append((variation, domain, types))

        return names[:count]

    def combine_words(self, words: List[str]) -> str:
        """智能组合单词"""
        if not words:
            return ""

        # 去重
        unique_words = []
        for w in words:
            if w not in unique_words:
                unique_words.append(w)

        if len(unique_words) == 1:
            # 单词，添加随机后缀
            suffix = random.choice(self.suffixes[3:])  # 避免空后缀
            return unique_words[0] + suffix

        elif len(unique_words) == 2:
            # 两个词的组合
            w1, w2 = unique_words

            # 尝试不同的组合方式
            combinations = [
                w1 + w2,
                w2 + w1,
                w1 + w2 + random.choice(["ly", "ify", "io", "go"]),
                w1 + (w2[0] if w2 else ""),  # 只取第二个词的首字母
                w2 + (w1[0] if w1 else ""),  # 只取第一个词的首字母
            ]

            return random.choice(combinations)

        else:
            # 多个词，取前两个或三个
            combo = ''.join(unique_words[:3])
            return combo

    def create_variation(self, reference: str) -> str:
        """基于参考名称创建变体"""
        variations = []

        # 添加前缀
        prefixes = ["get", "go", "my", "your", "the", "use"]
        for p in prefixes:
            variations.append(p + reference)

        # 添加后缀
        suffixes = ["app", "hub", "spot", "zone", "pay", "fund"]
        for s in suffixes:
            variations.append(reference + s)

        # 替换部分
        if "pay" in reference:
            for alt in ["tip", "fund", "donate", "back"]:
                variations.append(reference.replace("pay", alt))

        # 音近变体
        if "patreon" in reference:
            variations.extend(["patronize", "patronus", "pateron"])

        # 返回随机变体
        return random.choice(variations + [reference + "2"])

    def infer_types(self, pattern: List[str]) -> List[str]:
        """根据模式推断平台类型"""
        types = []

        if "payment" in pattern or "money" in pattern:
            types.append("payment")

        if "creator" in pattern or "artist" in pattern or "writer" in pattern:
            types.append("creator")

        if "platform" in pattern or "hub" in pattern or "spot" in pattern:
            types.append("platform")

        if "community" in pattern or "fans" in pattern:
            types.append("community")

        if not types:
            types = ["creator"]  # 默认类型

        return types

    def infer_types_from_name(self, name: str) -> List[str]:
        """从名称推断类型"""
        name_lower = name.lower()
        types = []

        if any(word in name_lower for word in ["pay", "tip", "fund", "donate", "cash", "money"]):
            types.append("payment")

        if any(word in name_lower for word in ["create", "creator", "artist", "maker", "writer"]):
            types.append("creator")

        if any(word in name_lower for word in ["fan", "member", "subscriber", "patron"]):
            types.append("community")

        if "hub" in name_lower or "spot" in name_lower or "zone" in name_lower:
            types.append("platform")

        if not types:
            types = ["creator"]

        return types

    def test(self):
        """测试生成效果"""
        print("🎨 智能名称生成测试")
        print("="*50)

        names = self.generate_meaningful_names(20)
        for i, (name, domain, types) in enumerate(names, 1):
            print(f"{i:2d}. {name:<20} -> {domain:<30} [{', '.join(types)}]")

if __name__ == "__main__":
    generator = SmartNameGenerator()
    generator.test()