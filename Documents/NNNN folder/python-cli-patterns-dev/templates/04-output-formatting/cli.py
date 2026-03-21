"""CLI 输出格式化模式 — Rich 表格、颜色、进度条、Spinner、JSON/CSV 输出"""

import json
import time
from typing import Any

import click

# ===== 1. 颜色与样式（纯 click，无第三方依赖）=====


def print_success(msg: str) -> None:
    click.secho(f"✓ {msg}", fg="green", bold=True)


def print_error(msg: str) -> None:
    click.secho(f"✗ {msg}", fg="red", bold=True, err=True)


def print_warning(msg: str) -> None:
    click.secho(f"⚠ {msg}", fg="yellow")


def print_info(msg: str) -> None:
    click.secho(f"ℹ {msg}", fg="cyan")


# ===== 2. 表格输出 =====


def format_table(headers: list[str], rows: list[list[Any]], col_width: int = 20) -> str:
    """简易文本表格"""
    sep = "+" + "+".join("-" * (col_width + 2) for _ in headers) + "+"
    header_row = "|" + "|".join(f" {h:<{col_width}} " for h in headers) + "|"
    lines = [sep, header_row, sep]
    for row in rows:
        lines.append("|" + "|".join(f" {str(v):<{col_width}} " for v in row) + "|")
    lines.append(sep)
    return "\n".join(lines)


def format_as_json(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)


def format_as_csv(headers: list[str], rows: list[list[Any]]) -> str:
    import csv
    import io
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(headers)
    writer.writerows(rows)
    return buf.getvalue()


# ===== 3. 输出格式选择器 =====


def output_records(
    records: list[dict],
    fmt: str,
    fields: list[str] | None = None,
) -> None:
    if not records:
        print_warning("No records found.")
        return

    keys = fields or list(records[0].keys())
    rows = [[r.get(k, "") for k in keys] for r in records]

    if fmt == "json":
        click.echo(format_as_json(records))
    elif fmt == "csv":
        click.echo(format_as_csv(keys, rows))
    else:  # table
        click.echo(format_table(keys, rows))


# ===== 4. CLI =====


@click.group()
def cli() -> None:
    """Output formatting patterns."""


@cli.command()
@click.option("--format", "fmt", type=click.Choice(["table", "json", "csv"]), default="table", show_default=True)
@click.option("--fields", default=None, help="Comma-separated fields to display.")
def list_users(fmt: str, fields: str | None) -> None:
    """List sample users in various formats."""
    users = [
        {"id": 1, "name": "Alice", "email": "alice@example.com", "role": "admin"},
        {"id": 2, "name": "Bob",   "email": "bob@example.com",   "role": "user"},
        {"id": 3, "name": "Carol", "email": "carol@example.com", "role": "user"},
    ]
    field_list = [f.strip() for f in fields.split(",")] if fields else None
    output_records(users, fmt, field_list)


@cli.command()
@click.argument("count", type=int, default=50)
@click.option("--delay", default=0.05, show_default=True, help="Delay per item (seconds).")
def batch_process(count: int, delay: float) -> None:
    """Process COUNT items with a progress bar."""
    results = {"success": 0, "failed": 0}
    with click.progressbar(range(count), label="Processing", fill_char="█", empty_char="░") as bar:
        for i in bar:
            time.sleep(delay)
            if i % 10 == 9:
                results["failed"] += 1
            else:
                results["success"] += 1

    click.echo("")
    print_success(f"{results['success']} succeeded")
    if results["failed"]:
        print_error(f"{results['failed']} failed")


@cli.command()
def spinner_demo() -> None:
    """Show an animated spinner (requires click-spinner or rich)."""
    steps = [
        ("Connecting to database", 0.5),
        ("Running migrations", 0.8),
        ("Seeding data", 0.4),
        ("Done!", 0.1),
    ]
    for step, duration in steps:
        click.echo(f"  → {step}...", nl=False)
        time.sleep(duration)
        click.secho(" done", fg="green")


@cli.command()
def status() -> None:
    """Show a status dashboard."""
    headers = ["Service", "Status", "Uptime"]
    rows = [
        ["api-server",  "✓ running", "14d 2h"],
        ["db-primary",  "✓ running", "30d 5h"],
        ["redis-cache", "✓ running", "7d 11h"],
        ["worker",      "⚠ slow",    "2d 0h"],
    ]
    click.echo(format_table(headers, rows, col_width=15))


if __name__ == "__main__":
    cli()
