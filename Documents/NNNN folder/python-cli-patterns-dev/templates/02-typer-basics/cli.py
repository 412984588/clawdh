"""Typer CLI 模式 — FastAPI 风格的类型注解 CLI，自动帮助文本、子命令"""

from enum import Enum
from pathlib import Path
from typing import Annotated, Optional

import typer

# ===== 1. 应用实例 =====

app = typer.Typer(
    name="myapp",
    help="MyApp — a Typer-powered CLI tool.",
    no_args_is_help=True,
)

# 子应用（子命令组）
users_app = typer.Typer(help="Manage users.")
app.add_typer(users_app, name="users")

db_app = typer.Typer(help="Database operations.")
app.add_typer(db_app, name="db")


# ===== 2. 枚举选项 =====

class OutputFormat(str, Enum):
    json = "json"
    table = "table"
    csv = "csv"


class LogLevel(str, Enum):
    debug = "debug"
    info = "info"
    warning = "warning"
    error = "error"


# ===== 3. 基础命令 =====


@app.command()
def greet(
    name: Annotated[str, typer.Argument(help="Name to greet.")],
    count: Annotated[int, typer.Option("--count", "-c", help="How many times.")] = 1,
    upper: Annotated[bool, typer.Option("--upper/--no-upper")] = False,
) -> None:
    """Greet a user by NAME."""
    msg = f"Hello, {name}!"
    if upper:
        msg = msg.upper()
    for _ in range(count):
        typer.echo(msg)


@app.command()
def version() -> None:
    """Show the application version."""
    typer.echo("myapp version 1.0.0")


# ===== 4. 用户子命令 =====


@users_app.command("list")
def users_list(
    limit: Annotated[int, typer.Option(help="Max users to display.")] = 10,
    fmt: Annotated[OutputFormat, typer.Option("--format", "-f")] = OutputFormat.table,
    active_only: Annotated[bool, typer.Option("--active/--all")] = False,
) -> None:
    """List users."""
    typer.echo(f"Listing up to {limit} {'active ' if active_only else ''}users [{fmt}]")


@users_app.command("create")
def users_create(
    email: Annotated[str, typer.Option(prompt=True, help="User email.")],
    name: Annotated[str, typer.Option(prompt=True, help="Display name.")],
    admin: Annotated[bool, typer.Option("--admin/--no-admin", help="Grant admin role.")] = False,
) -> None:
    """Create a new user."""
    role = "admin" if admin else "user"
    typer.secho(f"✓ Created {role}: {name} <{email}>", fg=typer.colors.GREEN)


@users_app.command("delete")
def users_delete(
    user_id: Annotated[int, typer.Argument(help="User ID to delete.")],
    force: Annotated[bool, typer.Option("--force", "-f", help="Skip confirmation.")] = False,
) -> None:
    """Delete a user by USER_ID."""
    if not force:
        confirmed = typer.confirm(f"Delete user #{user_id}?")
        if not confirmed:
            raise typer.Abort()
    typer.secho(f"✓ Deleted user #{user_id}", fg=typer.colors.GREEN)


# ===== 5. 数据库子命令 =====


@db_app.command()
def migrate(
    target: Annotated[Optional[str], typer.Argument(help="Target revision (default: head).")] = None,
    dry_run: Annotated[bool, typer.Option("--dry-run", help="Show SQL without executing.")] = False,
) -> None:
    """Run database migrations."""
    rev = target or "head"
    if dry_run:
        typer.secho("[dry-run] Would migrate to: " + rev, fg=typer.colors.YELLOW)
    else:
        typer.echo(f"Migrating to: {rev}")
        typer.secho("✓ Migration complete", fg=typer.colors.GREEN)


@db_app.command()
def seed(
    fixture: Annotated[Path, typer.Argument(help="Fixture file path.")],
    clear: Annotated[bool, typer.Option("--clear/--no-clear")] = False,
) -> None:
    """Seed the database from a fixture file."""
    if not fixture.exists():
        typer.secho(f"Error: file not found: {fixture}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1)
    if clear:
        typer.echo("Clearing existing data...")
    typer.echo(f"Seeding from: {fixture}")
    typer.secho("✓ Done", fg=typer.colors.GREEN)


# ===== 6. 回调（全局选项）=====

@app.callback()
def main(
    verbose: Annotated[bool, typer.Option("--verbose", "-v", help="Enable verbose output.")] = False,
    log_level: Annotated[LogLevel, typer.Option(help="Log level.")] = LogLevel.info,
) -> None:
    """MyApp — production-grade CLI patterns with Typer."""
    if verbose:
        typer.echo(f"[{log_level.upper()}] Verbose mode on", err=True)


if __name__ == "__main__":
    app()
