#!/usr/bin/env python3
"""
Autonomous Platform Discovery & Verification System
Integrates CrewAI, Exa (Search), and Playwright (Verification) for a continuous workflow.
"""

import os
import json
import time
import random
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import BaseTool
from exa_py import Exa
from playwright.sync_api import sync_playwright

# Load environment variables
load_dotenv()

# Configuration
EXA_API_KEY = os.getenv("EXA_API_KEY")
ZHIPUAI_API_KEY = os.getenv("ZHIPUAI_API_KEY")

if not EXA_API_KEY:
    print("⚠️ Warning: EXA_API_KEY not found. Discovery might be limited.")
if not ZHIPUAI_API_KEY:
    print("❌ Error: ZHIPUAI_API_KEY not found.")
    exit(1)

# Initialize LLM
llm = LLM(
    model="openai/glm-4.6",
    temperature=0.1,
    api_key=ZHIPUAI_API_KEY,
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

# --- Tools ---

class ExaSearchTool(BaseTool):
    name: str = "Exa Semantic Search"
    description: str = "Search for personal payment platforms using Exa's semantic search. Returns a list of potential platforms."

    def _run(self, query: str) -> str:
        if not EXA_API_KEY:
            return json.dumps({"error": "EXA_API_KEY missing"})
        
        print(f"\n🔍 [Exa] Searching for: '{query}'")
        exa = Exa(EXA_API_KEY)
        try:
            # Search for results
            result = exa.search_and_contents(
                query,
                type="neural",
                use_autoprompt=True,
                num_results=10,
                text=True
            )
            
            platforms = []
            for res in result.results:
                platforms.append({
                    "name": res.title,
                    "url": res.url,
                    "snippet": res.text[:200] if res.text else ""
                })
            
            print(f"   ✅ Found {len(platforms)} results")
            return json.dumps(platforms)
        except Exception as e:
            return json.dumps({"error": str(e)})

class PlaywrightVerifyTool(BaseTool):
    name: str = "Website Verification"
    description: str = "Visit a URL to verify platform criteria (Personal Reg, Payment Receiving, Own System, US/ACH)."

    def _run(self, url: str) -> str:
        print(f"\n🕵️ [Verify] Visiting: {url}")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                page = context.new_page()
                try:
                    response = page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    if not response or response.status >= 400:
                        return json.dumps({"error": f"HTTP {response.status}"})
                    
                    # Wait for some content
                    page.wait_for_timeout(2000)
                    
                    # Extract key info
                    title = page.title()
                    content = page.inner_text('body').lower()[:10000]
                    
                    # Basic checks
                    has_pricing = "pricing" in content or "fees" in content
                    has_login = "login" in content or "sign in" in content or "sign up" in content
                    has_us = "us" in content or "usa" in content or "united states" in content or "ach" in content or "$" in content
                    
                    browser.close()
                    
                    return json.dumps({
                        "url": url,
                        "title": title,
                        "content_preview": content[:500],
                        "indicators": {
                            "has_pricing": has_pricing,
                            "has_login": has_login,
                            "has_us_market": has_us
                        }
                    })
                except Exception as e:
                    browser.close()
                    return json.dumps({"error": str(e)})
        except Exception as e:
            return json.dumps({"error": str(e)})

# --- System ---

class AutonomousWorkflow:
    def __init__(self):
        self.verified_file = "verified_platforms.json"
        self.rejected_file = "rejected_platforms.json"
        self.load_data()

    def load_data(self):
        try:
            with open(self.verified_file, 'r') as f: self.verified = json.load(f)
        except: self.verified = {"platforms": []}
        try:
            with open(self.rejected_file, 'r') as f: self.rejected = json.load(f)
        except: self.rejected = {"platforms": []}
        
        self.verified_urls = {p.get('url') or p.get('domain') for p in self.verified['platforms']}
        self.rejected_urls = {p.get('url') or p.get('domain') for p in self.rejected['platforms']}

    def save_data(self):
        with open(self.verified_file, 'w', encoding='utf-8') as f:
            json.dump(self.verified, f, ensure_ascii=False, indent=2)
        with open(self.rejected_file, 'w', encoding='utf-8') as f:
            json.dump(self.rejected, f, ensure_ascii=False, indent=2)

    def is_new(self, url: str) -> bool:
        # Simple normalization
        if '://' in url: url = url.split('://')[1]
        if url.endswith('/'): url = url[:-1]
        
        for v_url in self.verified_urls:
            if v_url and url in v_url: return False
        for r_url in self.rejected_urls:
            if r_url and url in r_url: return False
        return True

    def run_batch(self, batch_size=50):
        print(f"\n🔄 Starting Batch Processing (Target: {batch_size} platforms)")
        
        # Agents
        scout = Agent(
            role='Lead Discovery Scout',
            goal=f'Find {batch_size} NEW, high-potential personal payment platforms.',
            backstory='Expert at finding niche SaaS and payment tools using semantic search.',
            tools=[ExaSearchTool()],
            llm=llm,
            verbose=True
        )

        verifier = Agent(
            role='Strict Compliance Auditor',
            goal='Verify if platforms meet 4 strict criteria: Personal Reg, Receive Pay, Own System, US/ACH.',
            backstory='Uncompromising auditor. You reject anything that looks like a directory, bank, or crypto-only exchange.',
            tools=[PlaywrightVerifyTool()],
            llm=llm,
            verbose=True
        )

        analyst = Agent(
            role='Data Analyst',
            goal='Compile final verified list and update databases.',
            backstory=' meticulous data manager who ensures no duplicates and high data quality.',
            llm=llm,
            verbose=True
        )

        # Tasks
        queries = [
            "personal payment platforms for creators",
            "Stripe Connect alternatives for individuals",
            "collect donations without business entity",
            "sell digital products personal account",
            "freelance invoicing platforms US"
        ]
        selected_query = random.choice(queries)

        task_discovery = Task(
            description=f"""
            1. Use Exa Semantic Search to find platforms using query: '{selected_query}'.
            2. Find at least 10 potential platforms.
            3. Return a JSON list of platforms with 'name' and 'url'.
            """,
            agent=scout,
            expected_output="JSON list of discovered platforms."
        )

        task_verification = Task(
            description="""
            1. Take the list from the Scout.
            2. For each platform, use Website Verification tool.
            3. Check against 4 criteria:
               - Personal Registration (Can an individual sign up?)
               - Receive Payments (Can they get paid?)
               - Own System (Is it a standalone platform?)
               - US Market (Do they support US/ACH?)
            4. Return a JSON report: {"verified": [], "rejected": []}
            """,
            agent=verifier,
            expected_output="JSON report of verified and rejected platforms."
        )

        crew = Crew(
            agents=[scout, verifier],
            tasks=[task_discovery, task_verification],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        
        # Process Results (Simple parsing as backup)
        print("\n📝 Processing Results...")
        try:
            output_str = str(result)
            # Try to extract JSON
            if "{" in output_str and "}" in output_str:
                json_str = output_str[output_str.find("{"):output_str.rfind("}")+1]
                data = json.loads(json_str)
                
                new_verified = 0
                if "verified" in data:
                    for p in data["verified"]:
                        if self.is_new(p.get("url", "")):
                            p["verified_date"] = datetime.now().isoformat()
                            self.verified["platforms"].append(p)
                            self.verified_urls.add(p.get("url"))
                            new_verified += 1
                            print(f"   ✅ Added: {p.get('name')}")
                
                if "rejected" in data:
                    for p in data["rejected"]:
                        if self.is_new(p.get("url", "")):
                            p["rejected_date"] = datetime.now().isoformat()
                            self.rejected["platforms"].append(p)
                            self.rejected_urls.add(p.get("url"))

                self.save_data()
                print(f"   💾 Saved {new_verified} new verified platforms.")
                
        except Exception as e:
            print(f"⚠️ Error processing results: {e}")
            # Log raw output for manual review
            with open("last_batch_raw_output.txt", "w") as f:
                f.write(str(result))

    def start_loop(self):
        print("🚀 Starting Autonomous Discovery Loop")
        batch_count = 0
        while True:
            batch_count += 1
            print(f"\n=== Batch {batch_count} ===")
            try:
                self.run_batch()
            except Exception as e:
                print(f"❌ Batch failed: {e}")
            
            print("💤 Sleeping for 2 minutes...")
            time.sleep(120)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Run a single test batch")
    args = parser.parse_args()

    system = AutonomousWorkflow()
    
    if args.test:
        system.run_batch(batch_size=5)
    else:
        system.start_loop()
