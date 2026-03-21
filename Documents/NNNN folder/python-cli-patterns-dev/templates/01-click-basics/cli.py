"""Click 基础 CLI 模式 — 命令、选项、参数、帮助文本、组合命令"""

import sys
from pathlib import Path
from typing import Optional

import click

# ===== 1. 基础命令 =====


@click.command()
@click.option("--name", "-n", default="World", help="Name to greet.", show_default=True)
@click.option("--count", "-c", default=1, type=int, help="How many times to greet.", show_default=True)
@click.option("--upper/--no-upper", default=False, help="Uppercase output.")
def greet(name: str, count: int, upper: bool) -> None:
    """Greet NAME with a friendly message."""
    msg = f"Hello, {name}!"
    if upper:
        msg = msg.upper()
    for _ in range(count):
        click.echo(msg)


# ===== 2. 参数类型 =====


@click.command()
@click.argument("filename", type=click.Path(exists=False))
@click.argument("size", type=int)
@click.option("--format", "fmt", type=click.Choice(["json", "csv", "txt"], case_sensitive=False), default="json")
@click.option("--output", "-o", type=click.Path(), default=None, help="Output directory.")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output.")
def generate(filename: str, size: int, fmt: str, output: Optional[str], verbose: bool) -> None:
    """Generate FILENAME with SIZE records in FORMAT."""
    out_path = Path(output or ".") / filename
    if verbose:
        click.echo(f"Generating {size} records → {out_path} ({fmt})", err=True)
    click.echo(f"Generated: {out_path}")


# ===== 3. 命令组（多级 CLI）=====


@click.group()
@click.option("--debug/--no-debug", envvar="APP_DEBUG", default=False, help="Enable debug mode.")
@click.version_option(version="1.0.0", prog_name="myapp")
@click.pass_context
def cli(ctx: click.Context, debug: bool) -> None:
    """MyApp — a sample multi-command CLI tool."""
    ctx.ensure_object(dict)
    ctx.obj["debug"] = debug
    if debug:
        click.echo("[DEBUG] Debug mode enabled", err=True)


# ── users 子命令组 ──

@cli.group()
def users() -> None:
    """Manage users."""


@users.command("list")
@click.option("--limit", default=10, show_default=True, help="Max users to display.")
@click.option("--format", "fmt", type=click.Choice(["table", "json"]), default="table")
@click.pass_context
def users_list(ctx: click.Context, limit: int, fmt: str) -> None:
    """List all users."""
    debug = ctx.obj.get("debug", False)
    if debug:
        click.echo(f"[DEBUG] Listing {limit} users in {fmt} format", err=True)
    click.echo(f"Showing up to {limit} users ({fmt} format)")


@users.command("create")
@click.option("--email", required=True, prompt="Email address", help="User email.")
@click.option("--name", required=True, prompt="Display name", help="User display name.")
@click.option("--role", type=click.Choice(["admin", "user"]), default="user")
def users_create(email: str, name: str, role: str) -> None:
    """Create a new user."""
    click.echo(f"✓ Created user: {name} <{email}> (role={role})")


@users.command("delete")
@click.argument("user_id", type=int)
@click.option("--yes", "-y", is_flag=True, help="Skip confirmation.")
def users_delete(user_id: int, yes: bool) -> None:
    """Delete user USER_ID."""
    if not yes:
        click.confirm(f"Delete user #{user_id}?", abort=True)
    click.echo(f"✓ Deleted user #{user_id}")


# ── config 子命令 ──

@cli.command()
@click.option("--set", "key_value", nargs=2, multiple=True, metavar="KEY VALUE", help="Set a config key.")
@click.option("--get", "key", default=None, help="Get a config value.")
def config(key_value: tuple, key: Optional[str]) -> None:
    """Manage application configuration."""
    if key:
        click.echo(f"config.{key} = (not set)")
    for k, v in key_value:
        click.echo(f"Set config.{k} = {v}")


# ===== 4. 文件输入/输出 =====


@click.command()
@click.argument("input_file", type=click.File("r"), default="-")
@click.argument("output_file", type=click.File("w"), default="-")
@click.option("--uppercase", is_flag=True)
def transform(input_file, output_file, uppercase: bool) -> None:
    """Read INPUT_FILE, transform, write to OUTPUT_FILE. Use - for stdin/stdout."""
    for line in input_file:
        transformed = line.upper() if uppercase else line
        output_file.write(transformed)


# ===== 5. 进度条 =====


@click.command()
@click.argument("count", type=int, default=100)
def process(count: int) -> None:
    """Process COUNT items with a progress bar."""
    import time
    with click.progressbar(range(count), label="Processing") as bar:
        for _ in bar:
            time.sleep(0.01)  # 模拟工作
    click.secho("✓ Done!", fg="green")


if __name__ == "__main__":
    cli()
