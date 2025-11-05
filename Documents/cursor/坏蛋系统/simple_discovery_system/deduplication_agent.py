#!/usr/bin/env python3
"""
🔍 Deduplication Agent - 去重检查专家
极简但稳定的4-Agent平台发现系统 - 去重Agent

职责：
1. 维护已知平台数据库
2. 执行多维度去重检查
3. 更新去重规则
4. 生成去重报告

使用方法：
python3 deduplication_agent.py [check|update|report|add platform_url]
"""

import json
import time
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
import hashlib

class DeduplicationAgent:
    def __init__(self):
        self.data_path = Path(__file__).parent / "data"
        self.config_file = self.data_path.parent / "config" / "system_config.json"
        self.known_platforms_file = self.data_path / "known_platforms.json"
        self.deduplication_log_file = self.data_path / "deduplication_log.json"

        # 确保数据目录存在
        self.data_path.mkdir(exist_ok=True)

        # 加载配置
        self.config = self.load_config()
        self.known_platforms = self.load_known_platforms()
        self.deduplication_log = self.load_deduplication_log()

    def load_config(self):
        """加载系统配置"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {self.config_file}")
            return None

    def load_known_platforms(self):
        """加载已知平台列表"""
        if self.known_platforms_file.exists():
            try:
                with open(self.known_platforms_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data
            except Exception as e:
                print(f"⚠️ 已知平台文件加载失败: {e}")

        # 创建默认结构
        return {
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "total_platforms": 0,
                "categories": {"verified": 0, "failed": 0, "pending": 0}
            },
            "platforms": [],
            "deduplication_rules": {
                "domain_patterns": [],
                "company_names": [],
                "excluded_keywords": [],
                "fuzzy_match_threshold": 0.8
            }
        }

    def load_deduplication_log(self):
        """加载去重日志"""
        if self.deduplication_log_file.exists():
            try:
                with open(self.deduplication_log_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ 去重日志加载失败: {e}")

        return {
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "total_checks": 0,
                "duplicates_found": 0,
                "unique_platforms": 0
            },
            "checks": []
        }

    def save_known_platforms(self):
        """保存已知平台列表"""
        try:
            with open(self.known_platforms_file, 'w', encoding='utf-8') as f:
                json.dump(self.known_platforms, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存已知平台失败: {e}")

    def save_deduplication_log(self):
        """保存去重日志"""
        self.deduplication_log["metadata"]["last_updated"] = datetime.now().isoformat()
        try:
            with open(self.deduplication_log_file, 'w', encoding='utf-8') as f:
                json.dump(self.deduplication_log, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存去重日志失败: {e}")

    def check_platform(self, platform_url, platform_name=None):
        """检查平台是否重复"""
        print(f"🔍 检查平台: {platform_url}")

        if not platform_name:
            platform_name = self.extract_name_from_url(platform_url)

        # 解析URL
        try:
            parsed_url = urlparse(platform_url)
            domain = parsed_url.netloc.lower().replace('www.', '')
        except:
            print("❌ URL解析失败")
            return {"status": "error", "reason": "invalid_url"}

        # 执行多维度去重检查
        checks = {
            "exact_domain_match": self.check_exact_domain(domain),
            "domain_pattern_match": self.check_domain_patterns(domain),
            "company_name_match": self.check_company_name_match(platform_name, domain),
            "fuzzy_similarity": self.check_fuzzy_similarity(platform_name, domain),
            "subdomain_check": self.check_subdomain_relationship(domain),
            "ip_address_check": self.check_ip_address_relationship(domain),
            "content_similarity": self.check_content_similarity(platform_url)
        }

        # 汇总结果
        is_duplicate = any(check["is_match"] for check in checks.values())

        result = {
            "platform_url": platform_url,
            "platform_name": platform_name,
            "domain": domain,
            "is_duplicate": is_duplicate,
            "checks": checks,
            "check_time": datetime.now().isoformat(),
            "recommendation": "skip" if is_duplicate else "proceed"
        }

        # 记录检查结果
        self.log_check(result)

        # 输出结果
        if is_duplicate:
            print("❌ 检测到重复平台")
            self.show_duplicate_reasons(checks)
        else:
            print("✅ 平台唯一，建议继续验证")

        return result

    def check_exact_domain(self, domain):
        """精确域名匹配"""
        for platform in self.known_platforms["platforms"]:
            if platform["domain"].lower() == domain:
                return {
                    "is_match": True,
                    "match_type": "exact_domain",
                    "matched_platform": platform["name"],
                    "platform_status": platform.get("status", "unknown")
                }

        return {"is_match": False, "match_type": "none"}

    def check_domain_patterns(self, domain):
        """域名模式匹配"""
        domain_patterns = self.known_platforms["deduplication_rules"].get("domain_patterns", [])

        for pattern in domain_patterns:
            if pattern.lower() in domain or domain in pattern.lower():
                # 找到对应的平台
                for platform in self.known_platforms["platforms"]:
                    if pattern.lower() in platform["domain"].lower():
                        return {
                            "is_match": True,
                            "match_type": "domain_pattern",
                            "matched_pattern": pattern,
                            "matched_platform": platform["name"]
                        }

        return {"is_match": False, "match_type": "none"}

    def check_company_name_match(self, platform_name, domain):
        """公司名称匹配"""
        company_names = self.known_platforms["deduplication_rules"].get("company_names", [])

        # 清理平台名称
        clean_name = self.clean_company_name(platform_name)

        for company in company_names:
            if company.lower() in clean_name.lower() or clean_name.lower() in company.lower():
                # 找到对应的平台
                for platform in self.known_platforms["platforms"]:
                    if company.lower() in platform["name"].lower():
                        return {
                            "is_match": True,
                            "match_type": "company_name",
                            "matched_company": company,
                            "matched_platform": platform["name"]
                        }

        return {"is_match": False, "match_type": "none"}

    def check_fuzzy_similarity(self, platform_name, domain):
        """模糊相似度检查"""
        similarity_threshold = self.known_platforms["deduplication_rules"].get("fuzzy_match_threshold", 0.8)

        max_similarity = 0
        best_match = None

        for platform in self.known_platforms["platforms"]:
            # 比较名称相似度
            name_similarity = self.calculate_similarity(platform_name.lower(), platform["name"].lower())

            # 比较域名相似度
            domain_similarity = self.calculate_similarity(domain.lower(), platform["domain"].lower())

            combined_similarity = max(name_similarity, domain_similarity)

            if combined_similarity > max_similarity:
                max_similarity = combined_similarity
                best_match = platform

        if max_similarity >= similarity_threshold:
            return {
                "is_match": True,
                "match_type": "fuzzy_similarity",
                "similarity_score": max_similarity,
                "matched_platform": best_match["name"]
            }

        return {
            "is_match": False,
            "match_type": "none",
            "similarity_score": max_similarity
        }

    def check_subdomain_relationship(self, domain):
        """检查子域名关系"""
        for platform in self.known_platforms["platforms"]:
            platform_domain = platform["domain"].lower()

            # 检查是否是子域名关系
            if self.is_subdomain(domain, platform_domain):
                return {
                    "is_match": True,
                    "match_type": "subdomain",
                    "parent_domain": platform_domain,
                    "matched_platform": platform["name"]
                }

            if self.is_subdomain(platform_domain, domain):
                return {
                    "is_match": True,
                    "match_type": "subdomain",
                    "subdomain": platform_domain,
                    "matched_platform": platform["name"]
                }

        return {"is_match": False, "match_type": "none"}

    def check_ip_address_relationship(self, domain):
        """检查IP地址关系"""
        # 在实际实现中，这里会查询DNS记录
        # 简化版本：检查常见CDN和托管服务的域名模式
        cdn_patterns = [
            r'.*\.cloudflare\.com$',
            r'.*\.amazonaws\.com$',
            r'.*\.azurewebsites\.net$',
            r'.*\.herokuapp\.com$',
            r'.*\.netlify\.app$'
        ]

        for platform in self.known_platforms["platforms"]:
            platform_domain = platform["domain"].lower()

            # 检查是否使用相同的托管服务
            if self.check_same_hosting_service(domain, platform_domain):
                return {
                    "is_match": True,
                    "match_type": "same_hosting",
                    "hosting_service": self.get_hosting_service(domain),
                    "matched_platform": platform["name"]
                }

        return {"is_match": False, "match_type": "none"}

    def check_content_similarity(self, platform_url):
        """检查内容相似度"""
        # 在实际实现中，这里会抓取网页内容进行比较
        # 简化版本：基于URL结构相似度
        url_structure = self.extract_url_structure(platform_url)

        for platform in self.known_platforms["platforms"]:
            platform_structure = self.extract_url_structure(platform["url"])

            similarity = self.calculate_similarity(url_structure, platform_structure)

            if similarity > 0.9:  # 非常高的相似度
                return {
                    "is_match": True,
                    "match_type": "content_similarity",
                    "similarity_score": similarity,
                    "matched_platform": platform["name"]
                }

        return {"is_match": False, "match_type": "none", "similarity_score": 0}

    def add_platform(self, platform_url, platform_name=None, status="pending"):
        """添加新平台到已知列表"""
        print(f"➕ 添加平台: {platform_url}")

        if not platform_name:
            platform_name = self.extract_name_from_url(platform_url)

        try:
            parsed_url = urlparse(platform_url)
            domain = parsed_url.netloc.lower().replace('www.', '')
        except:
            print("❌ URL解析失败")
            return False

        # 检查是否已存在
        if self.check_exact_domain(domain)["is_match"]:
            print("⚠️ 平台已存在")
            return False

        # 创建新平台记录
        new_platform = {
            "name": platform_name,
            "domain": domain,
            "url": platform_url,
            "status": status,
            "confidence": 0.0,
            "verification_date": None,
            "category": "unknown",
            "features": [],
            "notes": "新发现的平台，待验证",
            "added_date": datetime.now().isoformat()
        }

        # 添加到列表
        self.known_platforms["platforms"].append(new_platform)
        self.known_platforms["metadata"]["last_updated"] = datetime.now().isoformat()
        self.known_platforms["metadata"]["total_platforms"] = len(self.known_platforms["platforms"])

        # 更新去重规则
        self.update_deduplication_rules(new_platform)

        # 保存
        self.save_known_platforms()

        print(f"✅ 成功添加平台: {platform_name}")
        return True

    def update_deduplication_rules(self, platform):
        """更新去重规则"""
        domain = platform["domain"]
        name = platform["name"]

        # 添加域名模式
        if domain not in self.known_platforms["deduplication_rules"]["domain_patterns"]:
            self.known_platforms["deduplication_rules"]["domain_patterns"].append(domain)

        # 添加公司名称
        if name not in self.known_platforms["deduplication_rules"]["company_names"]:
            self.known_platforms["deduplication_rules"]["company_names"].append(name)

    def generate_report(self):
        """生成去重报告"""
        print("\n📊 去重Agent报告")
        print("=" * 50)

        total_platforms = len(self.known_platforms["platforms"])
        total_checks = self.deduplication_log["metadata"]["total_checks"]
        duplicates_found = self.deduplication_log["metadata"]["duplicates_found"]

        print(f"📈 统计信息:")
        print(f"  • 总平台数量: {total_platforms}")
        print(f"  • 总检查次数: {total_checks}")
        print(f"  • 发现重复: {duplicates_found}")
        print(f"  • 重复率: {(duplicates_found/max(total_checks,1)*100):.1f}%")

        # 按状态分类
        categories = {}
        for platform in self.known_platforms["platforms"]:
            status = platform.get("status", "unknown")
            categories[status] = categories.get(status, 0) + 1

        print(f"\n📋 平台分类:")
        for status, count in categories.items():
            print(f"  • {status}: {count}")

        # 去重规则统计
        rules = self.known_platforms["deduplication_rules"]
        print(f"\n🔍 去重规则:")
        print(f"  • 域名模式: {len(rules.get('domain_patterns', []))}")
        print(f"  • 公司名称: {len(rules.get('company_names', []))}")
        print(f"  • 排除关键词: {len(rules.get('excluded_keywords', []))}")

        # 最近的检查记录
        if self.deduplication_log["checks"]:
            print(f"\n📝 最近检查记录 (前5个):")
            recent_checks = self.deduplication_log["checks"][-5:]
            for check in reversed(recent_checks):
                status = "❌ 重复" if check["is_duplicate"] else "✅ 唯一"
                print(f"  {status} {check['platform_name']} ({check['domain']})")

    def show_status(self):
        """显示去重Agent状态"""
        print("\n📊 Deduplication Agent 状态")
        print("=" * 40)

        print(f"📚 已知平台: {len(self.known_platforms['platforms'])}")
        print(f"🔍 去重检查: {self.deduplication_log['metadata']['total_checks']}")
        print(f"❌ 发现重复: {self.deduplication_log['metadata']['duplicates_found']}")

        rules = self.known_platforms["deduplication_rules"]
        print(f"\n📋 去重规则:")
        print(f"  • 域名模式规则: {len(rules.get('domain_patterns', []))}")
        print(f"  • 公司名称规则: {len(rules.get('company_names', []))}")
        print(f"  • 模糊匹配阈值: {rules.get('fuzzy_match_threshold', 0.8)}")

    # 辅助方法
    def extract_name_from_url(self, url):
        """从URL提取平台名称"""
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.replace('www.', '')
            # 简单的名称提取：去掉.com等后缀，首字母大写
            name = domain.split('.')[0].title()
            return name
        except:
            return "Unknown"

    def clean_company_name(self, name):
        """清理公司名称"""
        # 移除常见的后缀和前缀
        suffixes = ["Inc", "LLC", "Corp", "Ltd", "Co", "Company", "Systems", "Solutions"]
        for suffix in suffixes:
            name = name.replace(suffix, "").strip()

        return name

    def calculate_similarity(self, str1, str2):
        """计算字符串相似度 (简单的编辑距离算法)"""
        if str1 == str2:
            return 1.0

        len1, len2 = len(str1), len(str2)
        if len1 == 0:
            return 0.0

        # 简化的相似度计算
        common_chars = len(set(str1) & set(str2))
        total_chars = len(set(str1) | set(str2))

        return common_chars / total_chars if total_chars > 0 else 0.0

    def is_subdomain(self, domain1, domain2):
        """检查是否是子域名关系"""
        if domain1 == domain2:
            return False

        return domain1.endswith('.' + domain2) or domain2.endswith('.' + domain1)

    def check_same_hosting_service(self, domain1, domain2):
        """检查是否使用相同的托管服务"""
        # 简化版本：检查常见的CDN模式
        cdn_indicators = ['cloudflare', 'aws', 'azure', 'heroku', 'netlify', 'vercel']

        domain1_lower = domain1.lower()
        domain2_lower = domain2.lower()

        for cdn in cdn_indicators:
            if cdn in domain1_lower and cdn in domain2_lower:
                return True

        return False

    def get_hosting_service(self, domain):
        """获取托管服务类型"""
        if 'cloudflare' in domain.lower():
            return 'Cloudflare'
        elif 'aws' in domain.lower() or 'amazonaws' in domain.lower():
            return 'AWS'
        elif 'azure' in domain.lower():
            return 'Azure'
        elif 'heroku' in domain.lower():
            return 'Heroku'
        elif 'netlify' in domain.lower():
            return 'Netlify'
        else:
            return 'Unknown'

    def extract_url_structure(self, url):
        """提取URL结构用于比较"""
        try:
            parsed_url = urlparse(url)
            path_parts = parsed_url.path.strip('/').split('/')
            return f"{parsed_url.netloc}/{path_parts[0] if path_parts else ''}"
        except:
            return url

    def log_check(self, result):
        """记录检查结果"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "platform_url": result["platform_url"],
            "platform_name": result["platform_name"],
            "domain": result["domain"],
            "is_duplicate": result["is_duplicate"],
            "recommendation": result["recommendation"]
        }

        self.deduplication_log["checks"].append(log_entry)
        self.deduplication_log["metadata"]["total_checks"] += 1

        if result["is_duplicate"]:
            self.deduplication_log["metadata"]["duplicates_found"] += 1
        else:
            self.deduplication_log["metadata"]["unique_platforms"] += 1

        # 保持日志文件大小
        if len(self.deduplication_log["checks"]) > 1000:
            self.deduplication_log["checks"] = self.deduplication_log["checks"][-500:]

        self.save_deduplication_log()

    def show_duplicate_reasons(self, checks):
        """显示重复原因"""
        for check_name, check_result in checks.items():
            if check_result["is_match"]:
                print(f"  • {check_name}: {check_result.get('matched_platform', 'Unknown')}")

def main():
    """主函数"""
    agent = DeduplicationAgent()

    import sys
    if len(sys.argv) < 2:
        agent.show_status()
        print("\n使用方法:")
        print("  python3 deduplication_agent.py check platform_url              # 检查平台")
        print("  python3 deduplication_agent.py add platform_url                 # 添加平台")
        print("  python3 deduplication_agent.py report                          # 生成报告")
        print("  python3 deduplication_agent.py status                         # 查看状态")
        return

    command = sys.argv[1].lower()

    if command == "check" and len(sys.argv) > 2:
        platform_url = sys.argv[2]
        platform_name = sys.argv[3] if len(sys.argv) > 3 else None
        agent.check_platform(platform_url, platform_name)

    elif command == "add" and len(sys.argv) > 2:
        platform_url = sys.argv[2]
        platform_name = sys.argv[3] if len(sys.argv) > 3 else None
        agent.add_platform(platform_url, platform_name)

    elif command == "report":
        agent.generate_report()

    elif command == "status":
        agent.show_status()

    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: check, add, report, status")

if __name__ == "__main__":
    main()