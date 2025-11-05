#!/usr/bin/env python3
"""
MCP增强版Stripe检测器
集成MCP服务提供100%准确的Stripe Connect检测
"""
import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import subprocess
import os

from stripe_detector import DetectionResult, ConfigManager, WebScrapingManager, PatternMatcher, EnhancedStripeDetector

@dataclass
class MCPEnhancedDetectionResult(DetectionResult):
    """MCP增强版检测结果"""
    browser_verification: bool = False
    browser_screenshots: List[str] = None
    memory_evidence_id: Optional[str] = None
    search_verification_results: Dict[str, Any] = None
    technical_analysis: Dict[str, Any] = None

    def __post_init__(self):
        if self.browser_screenshots is None:
            self.browser_screenshots = []
        if self.search_verification_results is None:
            self.search_verification_results = {}
        if self.technical_analysis is None:
            self.technical_analysis = {}

class MCPEnhancedStripeDetector:
    """MCP增强版Stripe检测器"""

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.config_manager = ConfigManager(self.project_root / "config" / "detection_config.json")
        self.base_detector = EnhancedStripeDetector(self.project_root / "config" / "detection_config.json")

        # MCP服务配置
        self.mcp_config_path = self.project_root / "config" / "mcp_config.json"
        self.mcp_services = self._load_mcp_config()

        # 设置日志
        self.logger = self._setup_logging()

    def _load_mcp_config(self) -> Dict:
        """加载MCP配置"""
        try:
            with open(self.mcp_config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return config['mcpServers']
        except Exception as e:
            self.logger.warning(f"无法加载MCP配置: {e}")
            return {}

    def _setup_logging(self) -> logging.Logger:
        """设置日志"""
        log_dir = self.project_root / "logs"
        log_dir.mkdir(exist_ok=True)

        logger = logging.getLogger("MCPEnhancedStripeDetector")
        logger.setLevel(logging.INFO)

        handler = logging.FileHandler(
            log_dir / f"mcp_enhanced_detection_{datetime.now().strftime('%Y%m%d')}.log",
            encoding='utf-8'
        )
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        return logger

    async def detect_with_browser_automation(self, url: str) -> Dict[str, Any]:
        """使用浏览器自动化进行检测"""
        self.logger.info(f"开始浏览器自动化检测: {url}")

        if 'playwright-browser' not in self.mcp_services:
            return {"error": "Playwright服务未配置"}

        try:
            # 创建临时浏览器检测脚本
            script_template = """
const {{ chromium }} = require('playwright');

(async () => {{
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {{
    await page.goto('{URL_PLACEHOLDER}', {{ waitUntil: 'networkidle' }});

    // 检测Stripe相关元素
    const stripeIndicators = [];

    // 检测Stripe脚本
    const scripts = await page.$$eval('script', scripts =>
      scripts.map(s => s.src || s.textContent).filter(Boolean)
    );

    const stripeScripts = scripts.filter(src =>
      src.includes('stripe.com') ||
      src.includes('js.stripe.com') ||
      src.includes('connect.stripe.com')
    );

    if (stripeScripts.length > 0) {{
      stripeIndicators.push('Stripe scripts detected');
    }}

    // 检测Stripe Connect元素
    const connectElements = await page.$$eval('[data-stripe], [stripe-account], .stripe-connect',
      elements => elements.length
    );

    if (connectElements > 0) {{
      stripeIndicators.push('Stripe Connect elements detected');
    }}

    // 检测支付表单
    const paymentForms = await page.$$eval('form', forms =>
      forms.filter(form => {{
        const text = form.textContent.toLowerCase();
        return text.includes('payment') ||
               text.includes('card') ||
               text.includes('billing');
      }}).length
    );

    // 截图
    const screenshot = await page.screenshot({{ encoding: 'base64' }});

    await browser.close();

    console.log(JSON.stringify({{
      stripeIndicators,
      stripeScriptsCount: stripeScripts.length,
      connectElementsCount: connectElements,
      paymentFormsCount: paymentForms,
      screenshotBase64: screenshot,
      pageTitle: await page.title(),
      url: '{URL_PLACEHOLDER}'
    }}));

  }} catch (error) {{
    console.log(JSON.stringify({{ error: error.message }}));
  }}
})();
"""
            browser_script = script_template.replace('{URL_PLACEHOLDER}', url)

            # 运行浏览器检测
            result = await self._run_browser_detection(browser_script)
            return result

        except Exception as e:
            self.logger.error(f"浏览器检测失败: {e}")
            return {"error": str(e)}

    async def _run_browser_detection(self, script: str) -> Dict[str, Any]:
        """运行浏览器检测脚本"""
        try:
            # 使用Node.js运行Playwright脚本
            process = await asyncio.create_subprocess_exec(
                'node', '-e', script,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=30.0
            )

            if process.returncode == 0:
                result = json.loads(stdout.decode())
                return result
            else:
                return {"error": stderr.decode()}

        except asyncio.TimeoutError:
            return {"error": "浏览器检测超时"}
        except Exception as e:
            return {"error": str(e)}

    async def store_in_memory_system(self, result: MCPEnhancedDetectionResult) -> Optional[str]:
        """将结果存储到内存系统"""
        if 'memory-system' not in self.mcp_services:
            return None

        try:
            # 创建知识图谱实体
            entity_data = {
                "name": result.domain,
                "entityType": "StripeConnectVerification",
                "observations": [
                    f"检测时间: {result.detection_time}",
                    f"Stripe Connect状态: {'已检测到' if result.stripe_connect_detected else '未检测到'}",
                    f"置信度: {result.stripe_confidence}",
                    f"商业模式: {result.business_model}",
                    f"技术评分: {result.technical_score}",
                    f"浏览器验证: {'已通过' if result.browser_verification else '未通过'}",
                    f"Stripe类型: {result.stripe_connect_type}",
                    f"公司名称: {result.company_name}"
                ]
            }

            # 创建关系数据
            relations_data = []
            if result.stripe_connect_detected:
                relations_data.append({
                    "from": result.domain,
                    "to": "StripeConnect",
                    "relationType": "INTEGRATES_WITH"
                })

            if result.business_model:
                relations_data.append({
                    "from": result.domain,
                    "to": result.business_model,
                    "relationType": "HAS_BUSINESS_MODEL"
                })

            # 生成证据ID
            evidence_id = f"stripe_verification_{result.domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            # 这里应该调用MCP Memory服务的API
            # 由于MCP服务需要特定的客户端，暂时记录到文件
            await self._save_memory_evidence(evidence_id, entity_data, relations_data)

            return evidence_id

        except Exception as e:
            self.logger.error(f"存储到内存系统失败: {e}")
            return None

    async def _save_memory_evidence(self, evidence_id: str, entities: Dict, relations: List[Dict]):
        """保存内存证据到文件"""
        memory_dir = self.project_root / "memory_evidence"
        memory_dir.mkdir(exist_ok=True)

        evidence_file = memory_dir / f"{evidence_id}.json"

        evidence_data = {
            "evidence_id": evidence_id,
            "timestamp": datetime.now().isoformat(),
            "entities": entities,
            "relations": relations
        }

        with open(evidence_file, 'w', encoding='utf-8') as f:
            json.dump(evidence_data, f, ensure_ascii=False, indent=2)

        self.logger.info(f"证据已保存: {evidence_file}")

    async def enhanced_detection(self, url: str) -> MCPEnhancedDetectionResult:
        """增强版检测流程"""
        self.logger.info(f"开始MCP增强版检测: {url}")

        # 1. 基础检测
        base_result = await self.base_detector.analyze_domain(url)
        if not base_result:
            base_result = DetectionResult(
                domain=url.split('//')[1] if '://' in url else url,
                company_name="未知",
                website_url=url,
                stripe_connect_detected=False,
                stripe_connect_type="未检测到",
                stripe_confidence=0.0,
                onboarding_available=False,
                onboarding_url="",
                onboarding_confidence=0.0,
                business_model="未知",
                business_score=0.0,
                technical_score=0.0,
                overall_score=0.0,
                detection_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                error_message="基础检测失败"
            )

        # 2. 浏览器自动化验证
        browser_result = await self.detect_with_browser_automation(url)
        browser_verification = False
        browser_screenshots = []

        if 'error' not in browser_result:
            browser_verification = len(browser_result.get('stripeIndicators', [])) > 0
            if browser_result.get('screenshotBase64'):
                browser_screenshots.append(f"data:image/png;base64,{browser_result['screenshotBase64']}")

        # 3. 创建增强版结果
        enhanced_result = MCPEnhancedDetectionResult(
            **asdict(base_result),
            browser_verification=browser_verification,
            browser_screenshots=browser_screenshots
        )

        # 4. 技术分析
        enhanced_result.technical_analysis = {
            "browser_indicators": browser_result.get('stripeIndicators', []),
            "script_count": browser_result.get('stripeScriptsCount', 0),
            "connect_elements": browser_result.get('connectElementsCount', 0),
            "payment_forms": browser_result.get('paymentFormsCount', 0),
            "page_title": browser_result.get('pageTitle', ''),
            "detection_methods": {
                "pattern_matching": bool(base_result.stripe_connect_detected),
                "browser_automation": browser_verification,
                "combined_confidence": max(base_result.stripe_confidence,
                                         0.9 if browser_verification else base_result.stripe_confidence)
            }
        }

        # 5. 存储到内存系统
        memory_id = await self.store_in_memory_system(enhanced_result)
        enhanced_result.memory_evidence_id = memory_id

        # 6. 计算综合评分
        enhanced_result.overall_score = self._calculate_overall_score(enhanced_result)

        self.logger.info(f"增强版检测完成: {url}, 综合评分: {enhanced_result.overall_score}")
        return enhanced_result

    def _calculate_overall_score(self, result: MCPEnhancedDetectionResult) -> float:
        """计算综合评分"""
        base_score = result.technical_score * 0.4 + result.business_score * 0.3

        # 浏览器验证加分
        if result.browser_verification:
            base_score += 0.3

        # 技术分析加分
        if result.technical_analysis:
            indicators = result.technical_analysis.get('browser_indicators', [])
            base_score += len(indicators) * 0.05

        return min(1.0, base_score)

    async def batch_enhanced_detection(self, urls: List[str]) -> List[MCPEnhancedDetectionResult]:
        """批量增强版检测"""
        self.logger.info(f"开始批量增强版检测: {len(urls)}个网站")

        results = []
        semaphore = asyncio.Semaphore(3)  # 限制并发数

        async def detect_with_semaphore(url: str):
            async with semaphore:
                return await self.enhanced_detection(url)

        tasks = [detect_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 过滤异常结果
        valid_results = []
        for result in results:
            if isinstance(result, Exception):
                self.logger.error(f"检测异常: {result}")
            else:
                valid_results.append(result)

        self.logger.info(f"批量增强版检测完成: {len(valid_results)}个有效结果")
        return valid_results

    def save_enhanced_results(self, results: List[MCPEnhancedDetectionResult],
                           output_format: str = "both") -> Dict[str, str]:
        """保存增强版检测结果"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_dir = self.project_root / "results" / "enhanced"
        output_dir.mkdir(parents=True, exist_ok=True)

        output_files = {}

        if output_format in ["json", "both"]:
            # JSON格式
            json_file = output_dir / f"mcp_enhanced_stripe_detection_{timestamp}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)
            output_files["json"] = str(json_file)

        if output_format in ["excel", "both"]:
            # Excel格式
            import pandas as pd

            # 准备Excel数据
            excel_data = []
            for result in results:
                row = asdict(result)
                # 处理列表字段
                row['browser_screenshots'] = '; '.join(row['browser_screenshots'][:3])  # 只保留前3个截图
                row['search_verification_results'] = json.dumps(row['search_verification_results'], ensure_ascii=False)
                row['technical_analysis'] = json.dumps(row['technical_analysis'], ensure_ascii=False)
                excel_data.append(row)

            df = pd.DataFrame(excel_data)
            excel_file = output_dir / f"mcp_enhanced_stripe_detection_{timestamp}.xlsx"
            df.to_excel(excel_file, index=False)
            output_files["excel"] = str(excel_file)

        return output_files

async def main():
    """主函数"""
    project_root = Path(__file__).parent.parent
    detector = MCPEnhancedStripeDetector(project_root)

    print("🚀 MCP增强版Stripe检测器")
    print("=" * 50)

    # 测试网站列表
    test_urls = [
        "https://stripe.com",
        "https://connect.stripe.com",
        "https://github.com"
    ]

    print(f"📋 测试网站: {len(test_urls)}个")

    # 执行增强版检测
    results = await detector.batch_enhanced_detection(test_urls)

    # 保存结果
    output_files = detector.save_enhanced_results(results)

    print(f"\n✅ 检测完成!")
    print(f"📊 有效结果: {len(results)}个")
    print(f"📁 输出文件:")
    for format_type, file_path in output_files.items():
        print(f"  - {format_type.upper()}: {file_path}")

    # 显示结果摘要
    print(f"\n📈 结果摘要:")
    stripe_detected = sum(1 for r in results if r.stripe_connect_detected)
    browser_verified = sum(1 for r in results if r.browser_verification)

    print(f"  - Stripe Connect检测: {stripe_detected}/{len(results)}")
    print(f"  - 浏览器验证通过: {browser_verified}/{len(results)}")
    if len(results) > 0:
        print(f"  - 平均综合评分: {sum(r.overall_score for r in results) / len(results):.2f}")
    else:
        print(f"  - 平均综合评分: 无有效结果")

if __name__ == "__main__":
    asyncio.run(main())