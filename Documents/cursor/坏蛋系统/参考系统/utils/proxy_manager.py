#!/usr/bin/env python3
"""
女王条纹测试2专用代理管理器
仅用于批量筛选功能的Cloudflare代理管理
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import aiohttp
import random
import logging
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import json
import os

@dataclass
class ProxyConfig:
    """代理配置"""
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    proxy_type: str = "http"  # http, https, socks4, socks5

@dataclass
class ProxyStatus:
    """代理状态"""
    config: ProxyConfig
    is_working: bool = False
    response_time: float = 0.0
    last_check: Optional[datetime] = None
    fail_count: int = 0
    success_count: int = 0

class QueenProxyManager:
    """女王条纹测试2专用代理管理器

    仅用于批量筛选功能，严格控制使用范围
    """

    def __init__(self, config_file: str = None):
        self.config_file = config_file or os.path.join(
            os.path.dirname(__file__), '..', 'config', 'proxy_config.json'
        )
        self.logger = logging.getLogger(__name__)
        self.proxies: List[ProxyStatus] = []
        self.current_proxy_index = 0
        self.enabled = False
        self._load_config()

    def _load_config(self):
        """加载代理配置"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    self.enabled = config.get('enabled', False)
                    proxy_configs = config.get('proxies', [])
                    self.proxies = [
                        ProxyStatus(
                            config=ProxyConfig(**proxy_data)
                        ) for proxy_data in proxy_configs
                    ]
                    self.logger.info(f"加载了 {len(self.proxies)} 个代理配置")
            else:
                self.logger.info("代理配置文件不存在，代理功能已禁用")
                self.enabled = False
        except Exception as e:
            self.logger.error(f"加载代理配置失败: {e}")
            self.enabled = False

    def is_enabled(self) -> bool:
        """检查代理是否启用"""
        return self.enabled and len(self.proxies) > 0

    def get_next_proxy(self) -> Optional[ProxyConfig]:
        """获取下一个可用代理"""
        if not self.is_enabled():
            return None

        # 过滤可用的代理
        working_proxies = [p for p in self.proxies if p.is_working or p.fail_count < 3]
        if not working_proxies:
            self.logger.warning("没有可用的代理")
            return None

        # 轮询选择代理
        proxy_status = working_proxies[self.current_proxy_index % len(working_proxies)]
        self.current_proxy_index += 1

        self.logger.debug(f"选择代理: {proxy_status.config.host}:{proxy_status.config.port}")
        return proxy_status.config

    def get_proxy_url(self, proxy_config: ProxyConfig) -> str:
        """生成代理URL"""
        if proxy_config.username and proxy_config.password:
            auth = f"{proxy_config.username}:{proxy_config.password}@"
        else:
            auth = ""

        return f"{proxy_config.proxy_type}://{auth}{proxy_config.config.host}:{proxy_config.config.port}"

    async def create_session(self, **kwargs) -> aiohttp.ClientSession:
        """创建带代理的aiohttp会话

        仅用于批量筛选功能
        """
        if not self.is_enabled():
            return aiohttp.ClientSession(**kwargs)

        proxy_config = self.get_next_proxy()
        if not proxy_config:
            return aiohttp.ClientSession(**kwargs)

        proxy_url = self.get_proxy_url(proxy_config)
        connector = aiohttp.TCPConnector(
            limit=10,
            limit_per_host=5,
            ssl=False  # 批量检测时通常不需要SSL验证
        )

        timeout = aiohttp.ClientTimeout(total=60)

        return aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            proxy=proxy_url,
            **kwargs
        )

    async def check_proxy_health(self, proxy_config: ProxyConfig) -> bool:
        """检查代理健康状态"""
        test_url = "http://httpbin.org/ip"
        proxy_url = self.get_proxy_url(proxy_config)

        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with aiohttp.ClientSession(
                timeout=timeout,
                proxy=proxy_url
            ) as session:
                async with session.get(test_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return 'origin' in data
        except Exception as e:
            self.logger.debug(f"代理健康检查失败 {proxy_config.host}:{proxy_config.port}: {e}")

        return False

    async def update_proxy_status(self, proxy_config: ProxyConfig, success: bool, response_time: float = 0.0):
        """更新代理状态"""
        for proxy_status in self.proxies:
            if proxy_status.config == proxy_config:
                if success:
                    proxy_status.success_count += 1
                    proxy_status.is_working = True
                    proxy_status.response_time = response_time
                    proxy_status.fail_count = 0
                else:
                    proxy_status.fail_count += 1
                    if proxy_status.fail_count >= 3:
                        proxy_status.is_working = False

                proxy_status.last_check = datetime.now()
                break

    def get_stats(self) -> Dict[str, Any]:
        """获取代理统计信息"""
        if not self.is_enabled():
            return {"enabled": False, "message": "代理功能已禁用"}

        working_proxies = [p for p in self.proxies if p.is_working]
        total_requests = sum(p.success_count + p.fail_count for p in self.proxies)

        return {
            "enabled": True,
            "total_proxies": len(self.proxies),
            "working_proxies": len(working_proxies),
            "total_requests": total_requests,
            "success_rate": sum(p.success_count for p in self.proxies) / max(total_requests, 1) * 100
        }

# 全局代理管理器实例（仅用于女王条纹测试2项目）
_queen_proxy_manager = None

def get_queen_proxy_manager() -> QueenProxyManager:
    """获取女王条纹测试2专用代理管理器"""
    global _queen_proxy_manager
    if _queen_proxy_manager is None:
        _queen_proxy_manager = QueenProxyManager()
    return _queen_proxy_manager

def is_batch_operation(context: str = None) -> bool:
    """判断是否为批量操作

    仅在以下情况下返回True：
    - batch_analyzer.py 中的批量分析
    - batch_detection_new_platforms.py 中的批量检测
    - tool_integrator.py 中的批量分析
    - 其他明确的批量筛选功能
    """
    if not context:
        return False

    batch_keywords = [
        'batch_analyzer',
        'batch_detection',
        'batch_analyze',
        '批量检测',
        '批量分析',
        'batch_detect',
        'tool_integrator'
    ]

    return any(keyword in context.lower() for keyword in batch_keywords)