"""CLI 配置管理模式 — TOML/YAML/JSON 配置文件、环境变量、优先级链"""

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import click

# ===== 1. 配置数据类 =====


@dataclass
class DatabaseConfig:
    url: str = "sqlite:///./app.db"
    pool_size: int = 5
    echo: bool = False


@dataclass
class AppConfig:
    debug: bool = False
    log_level: str = "info"
    host: str = "127.0.0.1"
    port: int = 8000
    database: DatabaseConfig = field(default_factory=DatabaseConfig)

    @property
    def bind_address(self) -> str:
        return f"{self.host}:{self.port}"


# ===== 2. 配置加载器（优先级：CLI 参数 > 环境变量 > 配置文件 > 默认值）=====


def load_json_config(path: Path) -> dict:
    """从 JSON 文件加载配置"""
    try:
        return json.loads(path.read_text())
    except (json.JSONDecodeError, OSError) as e:
        raise click.ClickException(f"Failed to load config {path}: {e}")


def load_toml_config(path: Path) -> dict:
    """从 TOML 文件加载配置（Python 3.11+ 内置 tomllib）"""
    import tomllib
    try:
        return tomllib.loads(path.read_text())
    except Exception as e:
        raise click.ClickException(f"Failed to load TOML config {path}: {e}")


def load_env_config(prefix: str = "APP_") -> dict:
    """从环境变量加载配置（APP_DEBUG → debug）"""
    config: dict[str, Any] = {}
    for key, value in os.environ.items():
        if key.startswith(prefix):
            clean_key = key[len(prefix):].lower()
            # 尝试类型推断
            if value.lower() in ("true", "1", "yes"):
                config[clean_key] = True
            elif value.lower() in ("false", "0", "no"):
                config[clean_key] = False
            elif value.isdigit():
                config[clean_key] = int(value)
            else:
                config[clean_key] = value
    return config


def merge_configs(*configs: dict) -> dict:
    """深度合并多个配置字典（后者覆盖前者）"""
    result: dict = {}
    for cfg in configs:
        for key, value in cfg.items():
            if isinstance(value, dict) and isinstance(result.get(key), dict):
                result[key] = merge_configs(result[key], value)
            else:
                result[key] = value
    return result


def build_app_config(
    config_file: Optional[Path] = None,
    overrides: Optional[dict] = None,
) -> AppConfig:
    """
    合并优先级：默认值 → 配置文件 → 环境变量 → 命令行覆盖
    """
    defaults = {
        "debug": False,
        "log_level": "info",
        "host": "127.0.0.1",
        "port": 8000,
        "database": {"url": "sqlite:///./app.db", "pool_size": 5},
    }

    file_config: dict = {}
    if config_file and config_file.exists():
        if config_file.suffix == ".json":
            file_config = load_json_config(config_file)
        elif config_file.suffix in (".toml", ".tml"):
            file_config = load_toml_config(config_file)

    env_config = load_env_config("APP_")
    cli_overrides = {k: v for k, v in (overrides or {}).items() if v is not None}

    merged = merge_configs(defaults, file_config, env_config, cli_overrides)

    db_raw = merged.get("database", {})
    return AppConfig(
        debug=merged.get("debug", False),
        log_level=merged.get("log_level", "info"),
        host=merged.get("host", "127.0.0.1"),
        port=int(merged.get("port", 8000)),
        database=DatabaseConfig(
            url=db_raw.get("url", "sqlite:///./app.db"),
            pool_size=int(db_raw.get("pool_size", 5)),
            echo=bool(db_raw.get("echo", False)),
        ),
    )


# ===== 3. CLI =====


@click.group()
@click.option("--config", "-c", type=click.Path(path_type=Path), default=None, help="Config file path.")
@click.option("--debug/--no-debug", envvar="APP_DEBUG", default=None, help="Debug mode.")
@click.option("--log-level", envvar="APP_LOG_LEVEL", type=click.Choice(["debug", "info", "warning", "error"]), default=None)
@click.pass_context
def cli(ctx: click.Context, config: Optional[Path], debug: Optional[bool], log_level: Optional[str]) -> None:
    """Configuration management example."""
    ctx.ensure_object(dict)
    app_config = build_app_config(
        config_file=config,
        overrides={"debug": debug, "log_level": log_level},
    )
    ctx.obj["config"] = app_config


@cli.command()
@click.pass_context
def show(ctx: click.Context) -> None:
    """Show current configuration."""
    cfg: AppConfig = ctx.obj["config"]
    click.echo(f"debug:     {cfg.debug}")
    click.echo(f"log_level: {cfg.log_level}")
    click.echo(f"host:      {cfg.host}")
    click.echo(f"port:      {cfg.port}")
    click.echo(f"db.url:    {cfg.database.url}")


@cli.command()
@click.argument("output", type=click.Path(path_type=Path), default=Path("config.json"))
@click.pass_context
def init(ctx: click.Context, output: Path) -> None:
    """Write default config to OUTPUT file."""
    cfg: AppConfig = ctx.obj["config"]
    data = {
        "debug": cfg.debug,
        "log_level": cfg.log_level,
        "host": cfg.host,
        "port": cfg.port,
        "database": {"url": cfg.database.url, "pool_size": cfg.database.pool_size},
    }
    output.write_text(json.dumps(data, indent=2))
    click.secho(f"✓ Config written to {output}", fg="green")


if __name__ == "__main__":
    cli()
