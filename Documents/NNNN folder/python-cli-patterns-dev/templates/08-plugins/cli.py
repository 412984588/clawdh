"""CLI 插件系统模式 — entry_points、动态加载、插件架构"""

import importlib
import importlib.util
import sys
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

import click

# ===== 1. 插件接口定义 =====


class CliPlugin(ABC):
    """所有插件必须继承此基类"""

    @property
    @abstractmethod
    def name(self) -> str:
        """插件名称（唯一标识）"""
        ...

    @property
    @abstractmethod
    def version(self) -> str:
        """插件版本"""
        ...

    @property
    def description(self) -> str:
        return ""

    @abstractmethod
    def register(self, cli_group: click.Group) -> None:
        """向 CLI 组注册命令"""
        ...

    def on_load(self) -> None:
        """插件加载时的钩子"""
        pass

    def on_unload(self) -> None:
        """插件卸载时的钩子"""
        pass


# ===== 2. 插件注册表 =====


class PluginRegistry:
    def __init__(self) -> None:
        self._plugins: dict[str, CliPlugin] = {}

    def register(self, plugin: CliPlugin) -> None:
        if plugin.name in self._plugins:
            raise ValueError(f"Plugin '{plugin.name}' is already registered")
        plugin.on_load()
        self._plugins[plugin.name] = plugin

    def unregister(self, name: str) -> bool:
        plugin = self._plugins.pop(name, None)
        if plugin:
            plugin.on_unload()
            return True
        return False

    def get(self, name: str) -> CliPlugin | None:
        return self._plugins.get(name)

    def list_plugins(self) -> list[dict[str, str]]:
        return [
            {"name": p.name, "version": p.version, "description": p.description}
            for p in self._plugins.values()
        ]

    def attach_all(self, cli_group: click.Group) -> None:
        for plugin in self._plugins.values():
            plugin.register(cli_group)


registry = PluginRegistry()


# ===== 3. 示例插件实现 =====


class GreetPlugin(CliPlugin):
    @property
    def name(self) -> str:
        return "greet"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def description(self) -> str:
        return "Greeting commands"

    def register(self, cli_group: click.Group) -> None:
        @cli_group.command("hello")
        @click.argument("name")
        def hello(name: str) -> None:
            """Say hello to NAME. (greet plugin)"""
            click.secho(f"Hello, {name}! (from greet plugin)", fg="cyan")

        @cli_group.command("bye")
        @click.argument("name")
        def bye(name: str) -> None:
            """Say goodbye to NAME. (greet plugin)"""
            click.secho(f"Goodbye, {name}!", fg="yellow")


class DiagnosticsPlugin(CliPlugin):
    @property
    def name(self) -> str:
        return "diagnostics"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def description(self) -> str:
        return "System diagnostic commands"

    def register(self, cli_group: click.Group) -> None:
        @cli_group.command()
        def doctor() -> None:
            """Run system diagnostics. (diagnostics plugin)"""
            checks = [
                ("Python version", f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"),
                ("Platform", sys.platform),
                ("click", click.__version__),
            ]
            for label, value in checks:
                click.echo(f"  {label:20s}: {value}")
            click.secho("✓ All checks passed", fg="green")


# ===== 4. 从文件动态加载插件 =====


def load_plugin_from_file(path: Path) -> CliPlugin | None:
    """从 .py 文件动态加载插件类"""
    spec = importlib.util.spec_from_file_location("_dynamic_plugin", path)
    if not spec or not spec.loader:
        return None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore[union-attr]

    for attr_name in dir(module):
        obj = getattr(module, attr_name)
        if (
            isinstance(obj, type)
            and issubclass(obj, CliPlugin)
            and obj is not CliPlugin
        ):
            return obj()
    return None


# ===== 5. CLI =====


@click.group()
def cli() -> None:
    """Plugin system demo."""


@cli.command("plugins")
@click.option("--format", "fmt", type=click.Choice(["table", "json"]), default="table")
def list_plugins(fmt: str) -> None:
    """List all registered plugins."""
    plugins = registry.list_plugins()
    if not plugins:
        click.echo("No plugins registered.")
        return
    if fmt == "json":
        import json
        click.echo(json.dumps(plugins, indent=2))
    else:
        click.echo(f"{'Name':<20} {'Version':<10} Description")
        click.echo("-" * 60)
        for p in plugins:
            click.echo(f"{p['name']:<20} {p['version']:<10} {p['description']}")


@cli.command("load")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
def load_plugin(path: Path) -> None:
    """Load a plugin from PATH."""
    plugin = load_plugin_from_file(path)
    if not plugin:
        raise click.ClickException(f"No CliPlugin subclass found in {path}")
    registry.register(plugin)
    registry.attach_all(cli)
    click.secho(f"✓ Plugin '{plugin.name}' loaded", fg="green")


# 注册内置插件
registry.register(GreetPlugin())
registry.register(DiagnosticsPlugin())
registry.attach_all(cli)

if __name__ == "__main__":
    cli()
