#!/usr/bin/env python3
"""
工具集成器 - 集成所有安装的检测工具
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import json
import subprocess
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import logging
from datetime import datetime

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.stripe_detector import DetectionResult, ConfigManager

@dataclass
class ToolIntegrationResult:
    """工具集成结果"""
    domain: str
    company_name: str
    website_url: str

    # Payment Gateway Scanner结果
    payment_gateways: List[str]
    captcha_detected: bool
    cloudflare_protected: bool
    graphql_detected: bool
    ecommerce_platforms: List[str]
    card_support: List[str]

    # Techackz结果
    technologies: List[Dict[str, Any]]
    vulnerabilities: List[Dict[str, Any]]
    confidence_scores: Dict[str, int]

    # Wappalyzergo结果
    wappalyzer_techs: List[Dict[str, Any]]

    # 原始Stripe检测结果
    stripe_detection: Optional[DetectionResult] = None

    # 综合评分
    integrated_stripe_confidence: float = 0.0
    integrated_business_score: float = 0.0
    integrated_overall_score: float = 0.0

    detection_time: str = ""
    error_message: Optional[str] = None

class ToolIntegrator:
    """工具集成器主类"""

    def __init__(self, config_path: str = None):
        """初始化工具集成器"""
        self.project_root = Path(__file__).parent.parent
        self.tools_dir = self.project_root / "tools"
        self.config_path = config_path or str(self.project_root / "config" / "detection_config.json")

        # 初始化配置
        self.config_manager = ConfigManager(self.config_path)
        self.stripe_detector = None

        # 工具路径
        self.payment_scanner_path = self.tools_dir / "payment-gateway-scanner" / "gate.py"
        self.techackz_path = self.tools_dir / "Techackz" / "techackz.py"
        self.wappalyzergo_path = self.tools_dir / "wappalyzergo"

        # 设置日志
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    async def run_payment_gateway_scanner(self, url: str) -> Dict[str, Any]:
        """运行Payment Gateway Scanner"""
        try:
            self.logger.info(f"运行Payment Gateway Scanner检测: {url}")

            # 创建临时脚本来自动化输入
            temp_script = self.tools_dir / "temp_payment_scan.py"
            temp_script.write_text(f"""
import sys
sys.path.append('{self.payment_scanner_path.parent}')

# 模拟输入URL
import sys
sys.argv = ['gate.py', '{url}']

# 导入并执行扫描逻辑
exec(open('{self.payment_scanner_path}').read())
""")

            result = subprocess.run(
                [sys.executable, str(temp_script)],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(self.payment_scanner_path.parent)
            )

            # 清理临时文件
            if temp_script.exists():
                temp_script.unlink()

            if result.returncode == 0:
                # 解析输出
                output = result.stdout
                return self._parse_payment_scanner_output(output, url)
            else:
                self.logger.error(f"Payment Gateway Scanner执行失败: {result.stderr}")
                return {"error": result.stderr}

        except Exception as e:
            self.logger.error(f"Payment Gateway Scanner异常: {str(e)}")
            return {"error": str(e)}

    def _parse_payment_scanner_output(self, output: str, url: str) -> Dict[str, Any]:
        """解析Payment Gateway Scanner输出"""
        result = {
            "url": url,
            "payment_gateways": [],
            "captcha_detected": False,
            "cloudflare_protected": False,
            "graphql_detected": False,
            "ecommerce_platforms": [],
            "card_support": [],
            "raw_output": output
        }

        lines = output.split('\n')
        for line in lines:
            line = line.strip()
            if "Payment Gateways:" in line:
                gateways = line.split(":", 1)[1].strip()
                if gateways and gateways != "None":
                    result["payment_gateways"] = [g.strip() for g in gateways.split(",")]
            elif "Captcha:" in line:
                result["captcha_detected"] = "True" in line
            elif "Cloudflare:" in line:
                result["cloudflare_protected"] = "True" in line
            elif "GraphQL:" in line:
                result["graphql_detected"] = "True" in line
            elif "Platforms:" in line:
                platforms = line.split(":", 1)[1].strip()
                if platforms and platforms != "None":
                    result["ecommerce_platforms"] = [p.strip() for p in platforms.split(",")]
            elif "Card Support:" in line:
                cards = line.split(":", 1)[1].strip()
                if cards and cards != "None":
                    result["card_support"] = [c.strip() for c in cards.split(",")]

        return result

    async def run_techackz(self, url: str) -> Dict[str, Any]:
        """运行Techackz工具"""
        try:
            self.logger.info(f"运行Techackz检测: {url}")

            output_file = self.tools_dir / f"techackz_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

            cmd = [
                sys.executable,
                str(self.techackz_path),
                "-u", url,
                "-o", str(output_file),
                "--detection-methods", "wappalyzer", "custom",
                "--show-all-detections"
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=str(self.techackz_path.parent)
            )

            if result.returncode == 0 and output_file.exists():
                with open(output_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # 清理临时文件
                output_file.unlink()

                return self._parse_techackz_result(data, url)
            else:
                self.logger.error(f"Techackz执行失败: {result.stderr}")
                return {"error": result.stderr}

        except Exception as e:
            self.logger.error(f"Techackz异常: {str(e)}")
            return {"error": str(e)}

    def _parse_techackz_result(self, data: Dict[str, Any], url: str) -> Dict[str, Any]:
        """解析Techackz结果"""
        result = {
            "url": url,
            "technologies": [],
            "vulnerabilities": [],
            "confidence_scores": {},
            "raw_data": data
        }

        # 提取技术信息
        if "technologies" in data:
            for tech in data["technologies"]:
                tech_info = {
                    "name": tech.get("name", ""),
                    "version": tech.get("version", ""),
                    "confidence": tech.get("confidence", 0),
                    "categories": tech.get("categories", []),
                    "website": tech.get("website", "")
                }
                result["technologies"].append(tech_info)
                result["confidence_scores"][tech_info["name"]] = tech_info["confidence"]

        # 提取漏洞信息
        if "vulnerabilities" in data:
            result["vulnerabilities"] = data["vulnerabilities"]

        # 提取Nuclei扫描结果
        if "nuclei_results" in data:
            result["vulnerabilities"].extend(data["nuclei_results"])

        return result

    async def run_wappalyzergo(self, url: str) -> Dict[str, Any]:
        """运行Wappalyzergo工具"""
        try:
            self.logger.info(f"运行Wappalyzergo检测: {url}")

            # 由于Wappalyzergo是Go工具，我们尝试使用它
            # 先尝试构建
            wappalyzergo_bin = self.wappalyzergo_path / "wappalyzergo"

            if not wappalyzergo_bin.exists():
                # 尝试构建
                build_result = subprocess.run(
                    ["go", "build", "-o", "wappalyzergo", "."],
                    timeout=60,
                    cwd=str(self.wappalyzergo_path)
                )
                if build_result.returncode != 0:
                    self.logger.warning("Wappalyzergo构建失败，使用备用检测方案")
                    return await self._fallback_wappalyzer_detection(url)

            # 运行检测
            if wappalyzergo_bin.exists():
                result = subprocess.run(
                    [str(wappalyzergo_bin), "-url", url],
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if result.returncode == 0:
                    return self._parse_wappalyzergo_output(result.stdout, url)
                else:
                    self.logger.warning(f"Wappalyzergo执行失败: {result.stderr}")
                    return await self._fallback_wappalyzer_detection(url)
            else:
                return await self._fallback_wappalyzer_detection(url)

        except Exception as e:
            self.logger.error(f"Wappalyzergo异常: {str(e)}")
            return await self._fallback_wappalyzer_detection(url)

    async def _fallback_wappalyzer_detection(self, url: str) -> Dict[str, Any]:
        """备用Wappalyzer检测方案"""
        try:
            # 使用Python的Wappalyzer库
            from Wappalyzer import Wappalyzer, WebPage

            wappalyzer = Wappalyzer.latest()
            webpage = WebPage.new_from_url(url)
            technologies = wappalyzer.analyze_with_versions(webpage)

            result = {
                "url": url,
                "technologies": [],
                "detection_method": "python_wappalyzer_fallback"
            }

            for tech_name, tech_data in technologies.items():
                tech_info = {
                    "name": tech_name,
                    "versions": tech_data.get("versions", []),
                    "categories": [cat.get("name", "") for cat in tech_data.get("categories", [])],
                    "confidence": 100  # Wappalyzer默认高置信度
                }
                result["technologies"].append(tech_info)

            return result

        except Exception as e:
            self.logger.error(f"备用Wappalyzer检测失败: {str(e)}")
            return {"error": str(e), "technologies": []}

    def _parse_wappalyzergo_output(self, output: str, url: str) -> Dict[str, Any]:
        """解析Wappalyzergo输出"""
        result = {
            "url": url,
            "technologies": [],
            "detection_method": "wappalyzergo",
            "raw_output": output
        }

        # 简单的JSON解析逻辑（根据实际输出格式调整）
        try:
            if output.strip().startswith('{'):
                data = json.loads(output)
                if "technologies" in data:
                    result["technologies"] = data["technologies"]
            else:
                # 文本解析逻辑
                lines = output.split('\n')
                for line in lines:
                    if ':' in line and not line.startswith(' '):
                        tech_name = line.split(':')[0].strip()
                        result["technologies"].append({
                            "name": tech_name,
                            "confidence": 80
                        })
        except:
            pass

        return result

    async def run_stripe_detector(self, url: str, company_name: str = "") -> Optional[DetectionResult]:
        """运行原始Stripe检测器"""
        try:
            if not self.stripe_detector:
                from src.stripe_detector import StripeDetector
                self.stripe_detector = StripeDetector(self.config_path)

            self.logger.info(f"运行Stripe检测: {url}")
            return await self.stripe_detector.analyze_website(url, company_name)

        except Exception as e:
            self.logger.error(f"Stripe检测异常: {str(e)}")
            return None

    def calculate_integrated_scores(self, tool_results: Dict[str, Any]) -> tuple[float, float, float]:
        """计算综合评分"""
        stripe_confidence = 0.0
        business_score = 0.0

        # 从Payment Gateway Scanner结果中评分
        if "payment_scanner" in tool_results:
            scanner_result = tool_results["payment_scanner"]
            if "stripe" in [g.lower() for g in scanner_result.get("payment_gateways", [])]:
                stripe_confidence += 0.4
            if scanner_result.get("ecommerce_platforms"):
                business_score += 0.3
            if scanner_result.get("card_support"):
                business_score += 0.2

        # 从Techackz结果中评分
        if "techackz" in tool_results:
            tech_result = tool_results["techackz"]
            tech_names = [t["name"].lower() for t in tech_result.get("technologies", [])]

            # 检测支付相关技术
            payment_techs = ["stripe", "paypal", "braintree", "adyen"]
            for tech in payment_techs:
                if tech in tech_names:
                    stripe_confidence += 0.2

            # 检测商业相关技术
            business_techs = ["shopify", "magento", "woocommerce", "bigcommerce"]
            for tech in business_techs:
                if tech in tech_names:
                    business_score += 0.2

        # 从Wappalyzergo结果中评分
        if "wappalyzergo" in tool_results:
            wapp_result = tool_results["wappalyzergo"]
            tech_names = [t["name"].lower() for t in wapp_result.get("technologies", [])]

            if "stripe" in tech_names:
                stripe_confidence += 0.2

        # 从原始Stripe检测中评分
        if "stripe_detection" in tool_results and tool_results["stripe_detection"]:
            stripe_detection = tool_results["stripe_detection"]
            stripe_confidence = max(stripe_confidence, stripe_detection.stripe_confidence)
            business_score = max(business_score, stripe_detection.business_score)

        # 计算综合评分
        overall_score = (stripe_confidence * 0.5 + business_score * 0.3 +
                        min(len(tool_results.get("techackz", {}).get("technologies", [])) * 0.05, 0.2))

        return min(stripe_confidence, 1.0), min(business_score, 1.0), min(overall_score, 1.0)

    async def analyze_website(self, url: str, company_name: str = "") -> ToolIntegrationResult:
        """综合分析网站"""
        self.logger.info(f"开始综合分析网站: {url}")

        # 初始化结果
        result = ToolIntegrationResult(
            domain=url.split('//')[1].split('/')[0] if '://' in url else url,
            company_name=company_name,
            website_url=url,
            payment_gateways=[],
            captcha_detected=False,
            cloudflare_protected=False,
            graphql_detected=False,
            ecommerce_platforms=[],
            card_support=[],
            technologies=[],
            vulnerabilities=[],
            confidence_scores={},
            wappalyzer_techs=[],
            detection_time=datetime.now().isoformat()
        )

        # 并行运行所有工具
        tasks = [
            self.run_payment_gateway_scanner(url),
            self.run_techackz(url),
            self.run_wappalyzergo(url),
            self.run_stripe_detector(url, company_name)
        ]

        tool_results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理结果
        tool_mapping = ["payment_scanner", "techackz", "wappalyzergo", "stripe_detection"]

        for i, tool_result in enumerate(tool_results):
            tool_name = tool_mapping[i]

            if isinstance(tool_result, Exception):
                self.logger.error(f"{tool_name}执行异常: {str(tool_result)}")
                continue

            if tool_name == "payment_scanner" and isinstance(tool_result, dict):
                if "error" not in tool_result:
                    result.payment_gateways = tool_result.get("payment_gateways", [])
                    result.captcha_detected = tool_result.get("captcha_detected", False)
                    result.cloudflare_protected = tool_result.get("cloudflare_protected", False)
                    result.graphql_detected = tool_result.get("graphql_detected", False)
                    result.ecommerce_platforms = tool_result.get("ecommerce_platforms", [])
                    result.card_support = tool_result.get("card_support", [])

            elif tool_name == "techackz" and isinstance(tool_result, dict):
                if "error" not in tool_result:
                    result.technologies = tool_result.get("technologies", [])
                    result.vulnerabilities = tool_result.get("vulnerabilities", [])
                    result.confidence_scores = tool_result.get("confidence_scores", {})

            elif tool_name == "wappalyzergo" and isinstance(tool_result, dict):
                if "error" not in tool_result:
                    result.wappalyzer_techs = tool_result.get("technologies", [])

            elif tool_name == "stripe_detection" and tool_result:
                result.stripe_detection = tool_result

        # 计算综合评分
        tool_results_dict = {
            "payment_scanner": tool_results[0] if not isinstance(tool_results[0], Exception) else {},
            "techackz": tool_results[1] if not isinstance(tool_results[1], Exception) else {},
            "wappalyzergo": tool_results[2] if not isinstance(tool_results[2], Exception) else {},
            "stripe_detection": tool_results[3] if not isinstance(tool_results[3], Exception) else None
        }

        (result.integrated_stripe_confidence,
         result.integrated_business_score,
         result.integrated_overall_score) = self.calculate_integrated_scores(tool_results_dict)

        self.logger.info(f"综合分析完成: Stripe置信度={result.integrated_stripe_confidence:.2f}, "
                        f"商业评分={result.integrated_business_score:.2f}, "
                        f"综合评分={result.integrated_overall_score:.2f}")

        return result

    async def batch_analyze(self, urls: List[str], company_names: List[str] = None) -> List[ToolIntegrationResult]:
        """批量分析网站"""
        if not company_names:
            company_names = [""] * len(urls)

        results = []
        for i, (url, company_name) in enumerate(zip(urls, company_names)):
            self.logger.info(f"分析进度: {i+1}/{len(urls)} - {url}")
            try:
                result = await self.analyze_website(url, company_name)
                results.append(result)
            except Exception as e:
                self.logger.error(f"分析网站失败 {url}: {str(e)}")
                # 创建错误结果
                error_result = ToolIntegrationResult(
                    domain=url.split('//')[1].split('/')[0] if '://' in url else url,
                    company_name=company_name,
                    website_url=url,
                    detection_time=datetime.now().isoformat(),
                    error_message=str(e)
                )
                results.append(error_result)

        return results

async def main():
    """主函数 - 测试用"""
    if len(sys.argv) < 2:
        print("用法: python tool_integrator.py <URL> [公司名称]")
        sys.exit(1)

    url = sys.argv[1]
    company_name = sys.argv[2] if len(sys.argv) > 2 else ""

    integrator = ToolIntegrator()
    result = await integrator.analyze_website(url, company_name)

    print("\n=== 综合分析结果 ===")
    print(f"网站: {result.website_url}")
    print(f"公司: {result.company_name}")
    print(f"支付网关: {', '.join(result.payment_gateways)}")
    print(f"电商平台: {', '.join(result.ecommerce_platforms)}")
    print(f"检测到的技术数量: {len(result.technologies)}")
    print(f"漏洞数量: {len(result.vulnerabilities)}")
    print(f"Stripe置信度: {result.integrated_stripe_confidence:.2f}")
    print(f"商业评分: {result.integrated_business_score:.2f}")
    print(f"综合评分: {result.integrated_overall_score:.2f}")

    # 保存详细结果
    output_file = f"integrated_analysis_{result.domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(asdict(result), f, ensure_ascii=False, indent=2)

    print(f"\n详细结果已保存到: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())