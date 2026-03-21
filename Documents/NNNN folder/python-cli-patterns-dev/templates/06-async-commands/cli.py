"""异步 CLI 模式 — asyncio 集成、并发 HTTP、异步任务"""

import asyncio
import time
from typing import Optional
from urllib.request import urlopen

import click

# ===== 1. asyncio + click 集成 =====

def run_async(coro):
    """在同步 click 命令中运行协程"""
    return asyncio.get_event_loop().run_until_complete(coro)


def async_command(func):
    """将 async def 包装为 click 可调用的同步函数"""
    import functools
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper


# ===== 2. 模拟异步任务 =====


async def fetch_url(url: str, timeout: float = 5.0) -> dict:
    """模拟异步 HTTP 获取（实际用 httpx/aiohttp）"""
    await asyncio.sleep(0.1)  # 模拟网络延迟
    return {"url": url, "status": 200, "size": 1024}


async def fetch_all(urls: list[str]) -> list[dict]:
    """并发获取多个 URL"""
    tasks = [fetch_url(url) for url in urls]
    return await asyncio.gather(*tasks)


async def process_item(item_id: int, delay: float = 0.05) -> dict:
    """模拟异步处理单个项目"""
    await asyncio.sleep(delay)
    return {"id": item_id, "status": "done"}


async def process_batch_concurrent(
    ids: list[int],
    concurrency: int = 10,
    on_progress: Optional[callable] = None,
) -> list[dict]:
    """使用信号量限制并发数"""
    sem = asyncio.Semaphore(concurrency)
    results = []

    async def _process(item_id: int) -> dict:
        async with sem:
            result = await process_item(item_id)
            if on_progress:
                on_progress(item_id, result)
            return result

    return await asyncio.gather(*[_process(i) for i in ids])


# ===== 3. CLI =====


@click.group()
def cli() -> None:
    """Async CLI patterns."""


@cli.command()
@click.argument("urls", nargs=-1, required=True)
@click.option("--timeout", default=10.0, show_default=True, help="Request timeout in seconds.")
def fetch(urls: tuple[str, ...], timeout: float) -> None:
    """Fetch multiple URLs concurrently."""
    async def _run():
        click.echo(f"Fetching {len(urls)} URL(s) concurrently...")
        start = time.perf_counter()
        results = await fetch_all(list(urls))
        elapsed = time.perf_counter() - start
        for r in results:
            status_color = "green" if r["status"] == 200 else "red"
            click.secho(f"  [{r['status']}] {r['url']} ({r['size']} bytes)", fg=status_color)
        click.echo(f"\nCompleted in {elapsed:.2f}s")

    asyncio.run(_run())


@cli.command()
@click.argument("count", type=int, default=100)
@click.option("--concurrency", "-j", default=10, show_default=True, help="Max concurrent tasks.")
@click.option("--delay", default=0.02, show_default=True, help="Per-task delay (seconds).")
def batch(count: int, concurrency: int, delay: float) -> None:
    """Process COUNT items with limited concurrency."""
    done = 0
    failed = 0

    async def _run():
        nonlocal done, failed

        async def _item(i: int) -> dict:
            nonlocal done, failed
            try:
                result = await process_item(i, delay)
                done += 1
                return result
            except Exception as e:
                failed += 1
                return {"id": i, "status": "error", "error": str(e)}

        sem = asyncio.Semaphore(concurrency)

        async def _bounded(i: int) -> dict:
            async with sem:
                return await _item(i)

        start = time.perf_counter()
        with click.progressbar(range(count), label="Processing") as bar:
            tasks = [_bounded(i) for i in bar]
        results = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - start

        click.echo(f"\nProcessed {len(results)} items in {elapsed:.2f}s")
        click.secho(f"  ✓ {done} succeeded", fg="green")
        if failed:
            click.secho(f"  ✗ {failed} failed", fg="red")

    asyncio.run(_run())


@cli.command()
@click.option("--interval", default=5, show_default=True, help="Poll interval (seconds).")
@click.option("--max-polls", default=5, show_default=True, help="Maximum poll attempts.")
def watch(interval: int, max_polls: int) -> None:
    """Watch for changes (polling demo)."""
    async def _run():
        click.echo(f"Watching... (interval={interval}s, max={max_polls})")
        for i in range(max_polls):
            await asyncio.sleep(0.1)  # 实际为 interval
            click.echo(f"  [{i+1}/{max_polls}] Checked at {time.strftime('%H:%M:%S')}")
        click.secho("Watch complete.", fg="cyan")

    asyncio.run(_run())


if __name__ == "__main__":
    cli()
