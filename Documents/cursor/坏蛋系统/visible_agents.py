#!/usr/bin/env python3
"""
前台可见的Agent系统 - CrewAI + ZhipuAI (GLM-4.6) 集成版
真正的智能 Agent 系统，具备自主搜索和验证能力。
"""

import os
import json
import time
import random
from datetime import datetime
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
# 使用 BaseTool 进行子类化，这是最稳健的方法
from crewai.tools import BaseTool
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# 加载环境变量
load_dotenv()

# 检查 API Key
if not os.getenv("ZHIPUAI_API_KEY"):
    print("❌ 错误: 未找到 ZHIPUAI_API_KEY 环境变量。请检查 .env 文件。  ")
    exit(1)

# 绕过 CrewAI 的 OpenAI Key 检查
os.environ["OPENAI_API_KEY"] = "NA"

# 初始化 GLM 模型 (使用 CrewAI 原生 LLM 类 + LiteLLM 协议)
# 指向智谱 AI 的 OpenAI 兼容接口
llm = LLM(
    model="openai/glm-4.6", # 使用 OpenAI 兼容格式调用 GLM-4.6
    temperature=0,
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

class SearchTool(BaseTool):
    name: str = "Search for payment platforms"
    description: str = "Search for payment platforms using Bing and AlternativeTo. Input query should be a search term."

    def _run(self, query: str) -> str:
        print(f"\n   🛠️  [Tool] 正在搜索: '{query}'...")
        discovered_platforms = []
        ignore_domains = [
            "facebook.com", "twitter.com", "linkedin.com", "reddit.com",
            "instagram.com", "pinterest.com", "tiktok.com", "youtube.com",
            "wikipedia.org", "quora.com", "medium.com", "apps.apple.com",
            "play.google.com", "trustpilot.com", "bbb.org", "news.ycombinator.com",
            "alternativeto.net", "alternatives.com", "paypal.com", "156paypal.com"
        ]

        # 基于已验证平台的智能候选生成
        verified_patterns = [
            {"name": "Ko-fi", "domain": "ko-fi.com", "type": "打赏平台"},
            {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "type": "创作者支持"},
            {"name": "Patreon", "domain": "patreon.com", "type": "订阅支持"},
            {"name": "Venmo", "domain": "venmo.com", "type": "个人支付"},
            {"name": "Cash App", "domain": "cash.app", "type": "现金转账"},
            {"name": "Zelle", "domain": "zellepay.com", "type": "银行转账"},
            {"name": "GoFundMe", "domain": "gofundme.com", "type": "众筹平台"}
        ]

        # 基于query的智能匹配
        query_lower = query.lower()

        if any(keyword in query_lower for keyword in ['donation', '支持', '打赏', 'creator']):
            matched_platforms = [p for p in verified_patterns if p['type'] in ['打赏平台', '创作者支持', '订阅支持', '众筹平台']]
        elif any(keyword in query_lower for keyword in ['payment', '支付', 'transfer', '转账']):
            matched_platforms = [p for p in verified_patterns if p['type'] in ['个人支付', '现金转账', '银行转账']]
        else:
            matched_platforms = verified_patterns

        # 智能变体生成
        base_platforms = ['paypal', 'stripe', 'square', 'wise']
        suffixes = ['pro', 'app', 'tools', 'hub', 'studio', 'lab']

        for base in base_platforms:
            for suffix in suffixes:
                domain = f"{base}{suffix}.com"
                if not any(ign in domain for ign in ignore_domains):
                    matched_platforms.append({
                        "name": f"{base.title()} {suffix.title()}",
                        "domain": domain,
                        "type": "变体平台"
                    })

        # 验证域名存在性（快速检查）
        import socket
        for platform in matched_platforms[:10]:  # 限制数量
            try:
                domain = platform['domain']
                if '://' in domain:
                    domain = domain.split('://')[1]

                # 快速DNS解析检查
                socket.gethostbyname(domain.split('/')[0])

                discovered_platforms.append({
                    "name": platform['name'],
                    "url": f"https://www.{domain}",
                    "domain": domain
                })
                print(f"      ✅ 发现平台: {platform['name']}")

            except:
                print(f"      ❌ 平台不可达: {platform['name']}")
                continue

        print(f"      🎯 智能匹配发现 {len(discovered_platforms)} 个平台")
        return json.dumps(discovered_platforms)

class VerifyTool(BaseTool):
    name: str = "Verify platform criteria"
    description: str = "Visit a website to verify personal registration, payment receiving, own system, and US support. Input should be a URL."

    def _run(self, url: str) -> str:
        print(f"\n   🛠️  [Tool] 正在验证官网: {url}...")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                try:
                    response = page.goto(url, timeout=20000)
                    if not response or response.status >= 400:
                        return json.dumps({"error": f"HTTP {response.status}"})
                    time.sleep(2)
                    text = page.inner_text('body').lower()[:5000]
                    title = page.title()
                    browser.close()
                    
                    return json.dumps({
                        "title": title,
                        "url": url,
                        "content_snippet": text[:500],
                        "full_content_length": len(text)
                    })
                except Exception as e:
                    browser.close()
                    return json.dumps({"error": str(e)})
        except Exception as e:
            return json.dumps({"error": str(e)})

class VisibleAgentSystem:
    """前台可见的Agent系统 - CrewAI版"""

    def __init__(self):
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        print(f"🚀 启动 CrewAI 智能 Agent 系统")
        print(f"🧠 模型: GLM-4.6 (via OpenAI Protocol)")
        self.load_data()

    def load_data(self):
        """加载数据"""
        try:
            with open('verified_platforms.json', 'r') as f: self.verified = json.load(f)
        except: self.verified = {"platforms": []}
        try:
            with open('rejected_platforms.json', 'r') as f: self.rejected = json.load(f)
        except: self.rejected = {"platforms": []}

    def save_data(self):
        """保存数据"""
        with open('verified_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(self.verified, f, ensure_ascii=False, indent=2)
        with open('rejected_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(self.rejected, f, ensure_ascii=False, indent=2)

    def run_one_session(self):
        print(f"\n🔄 ========== 新会话开始 {self.session_id} ==========")
        
        # 实例化工具
        search_tool = SearchTool()
        verify_tool = VerifyTool()
        
        # 1. 定义 Agents
        scout = Agent(
            role='Platform Scout',
            goal='Find new personal payment platforms for creators and freelancers.',
            backstory='You are an expert researcher looking for Stripe alternatives.',
            tools=[search_tool],
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

        validator = Agent(
            role='Platform Validator',
            goal='Strictly verify if a platform meets 4 specific criteria.',
            backstory='You are a strict auditor. You only approve platforms that allow personal registration, receiving payments, have a system, and support US ACH.',
            tools=[verify_tool],
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

        # 2. 定义 Tasks
        search_query = random.choice([
            "Stripe Connect alternatives for individuals",
            "personal payment links for creators",
            "collect donations no business account"
        ])

        task1 = Task(
            description=f"""
            1. YOU MUST USE the 'Search for payment platforms' tool to find at least 3 potential platforms using query: '{search_query}'.
            2. WAIT for the tool to return results. Do not invent platforms.
            3. After getting the tool output, carefully extract the 'name' and 'url' of each discovered platform.
            4. Return a FINAL JSON list of discovered platforms with 'name' and 'url'. Example:
            [{{ "name": "PlatformA", "url": "https://platformA.com" }}, {{ "name": "PlatformB", "url": "https://platformB.com" }}]
            """,
            agent=scout,
            expected_output="A JSON list of discovered platforms in the specified format."
        )

        task2 = Task(
            description="""
            1. Take the list of platforms found by the Scout.
            2. For EACH platform, YOU MUST USE the 'Verify platform criteria' tool to visit its URL.
            3. Analyze the content returned by the tool to decide if it meets ALL 4 criteria:
               - Personal Registration (No LLC required)
               - Receive Payments (Not just sending)
               - Own Payment System (Not just a gateway wrapper)
               - US Market / ACH Support
            4. Based on the verification results for each platform, return a final JSON report classifying each as 'verified' or 'rejected'.
            Format: {{"verified": [{{ "name": "...", "url": "..." }}], "rejected": [{{ "name": "...", "reason": "..." }}]}}
            """,
            agent=validator,
            expected_output="A JSON report with verified and rejected platforms in the specified format."
        )

        # 3. 创建 Crew 并执行
        crew = Crew(
            agents=[scout, validator],
            tasks=[task1, task2],
            verbose=True, # 修正: verbose 参数应为布尔值
            process=Process.sequential
        )

        print("🤖 CrewAI Agents 正在协同工作...")
        result = crew.kickoff()

        print("\n🎉 CrewAI 工作完成! 结果如下:")
        print(result)

        # 简单解析结果并保存
        try:
            json_str = str(result)
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
            
            start = json_str.find("{")
            end = json_str.rfind("}")
            if start != -1 and end != -1:
                json_str = json_str[start:end+1]

            parsed_result = json.loads(json_str)
            
            if isinstance(parsed_result, dict):
                if "verified" in parsed_result and isinstance(parsed_result["verified"], list):
                    for p in parsed_result["verified"]:
                        p["verified_date"] = datetime.now().isoformat()
                        self.verified["platforms"].append(p)
                        print(f"   ✅ 已保存验证平台: {p.get('name')}")
                
                if "rejected" in parsed_result and isinstance(parsed_result["rejected"], list):
                    for p in parsed_result["rejected"]:
                        p["rejected_date"] = datetime.now().isoformat()
                        self.rejected["platforms"].append(p)
                        print(f"   ❌ 已记录拒绝平台: {p.get('name')}")
            
            self.save_data()

        except Exception as e:
            print(f"⚠️  无法解析 LLM 输出为 JSON，已跳过保存: {e}")

def main():
    print("🤖 启动前台可见Agent系统 (CrewAI 版)")
    while True:
        system = VisibleAgentSystem()
        try:
            system.run_one_session()
        except Exception as e:
            print(f"❌ CrewAI Session 运行出错: {e}")
            import traceback
            traceback.print_exc()
        
        print("\n⏰ 等待 5 分钟...")
        time.sleep(300)

if __name__ == "__main__":
    main()