"""CLI 测试模式 — click.testing.CliRunner、pytest fixtures、模拟 stdin/stdout"""

import json
from pathlib import Path
from typing import Optional

import click
from click.testing import CliRunner

# ===== 1. 被测 CLI =====


@click.group()
@click.option("--verbose/--quiet", default=False, help="Verbose output.")
@click.pass_context
def cli(ctx: click.Context, verbose: bool) -> None:
    """CLI under test."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose


@cli.command()
@click.argument("name")
@click.option("--greeting", default="Hello", show_default=True)
def greet(name: str, greeting: str) -> None:
    """Greet NAME."""
    click.echo(f"{greeting}, {name}!")


@cli.command()
@click.argument("numbers", nargs=-1, type=float, required=True)
@click.option("--op", type=click.Choice(["sum", "avg", "max", "min"]), default="sum")
def calc(numbers: tuple[float, ...], op: str) -> None:
    """Calculate OP of NUMBERS."""
    if op == "sum":
        result = sum(numbers)
    elif op == "avg":
        result = sum(numbers) / len(numbers)
    elif op == "max":
        result = max(numbers)
    else:
        result = min(numbers)
    click.echo(f"{op}({', '.join(str(n) for n in numbers)}) = {result}")


@cli.command()
@click.argument("path", type=click.Path(path_type=Path))
@click.option("--format", "fmt", type=click.Choice(["text", "json"]), default="text")
def read(path: Path, fmt: str) -> None:
    """Read and display a file."""
    if not path.exists():
        raise click.ClickException(f"File not found: {path}")
    content = path.read_text()
    if fmt == "json":
        try:
            data = json.loads(content)
            click.echo(json.dumps(data, indent=2))
        except json.JSONDecodeError:
            raise click.ClickException("File is not valid JSON")
    else:
        click.echo(content)


@cli.command()
@click.option("--confirm/--no-confirm", default=True)
def dangerous(confirm: bool) -> None:
    """A command requiring confirmation."""
    if confirm:
        if not click.confirm("Are you sure?"):
            raise click.Abort()
    click.secho("✓ Action performed.", fg="green")


# ===== 2. 测试辅助 =====


def make_runner(mix_stderr: bool = False) -> CliRunner:
    """创建隔离的测试 runner"""
    return CliRunner(mix_stderr=mix_stderr)


def invoke(cmd, args: list, input: Optional[str] = None, catch_exceptions: bool = True):
    """便捷调用包装器"""
    runner = CliRunner(mix_stderr=False)
    return runner.invoke(cmd, args, input=input, catch_exceptions=catch_exceptions)


# ===== 3. 内联测试 =====


def _assert(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(f"FAIL: {message}")
    print(f"  ✓ {message}")


def test_greet_default() -> None:
    result = invoke(cli, ["greet", "Alice"])
    _assert(result.exit_code == 0, "exit code 0")
    _assert("Hello, Alice!" in result.output, "default greeting")


def test_greet_custom() -> None:
    result = invoke(cli, ["greet", "Bob", "--greeting", "Hi"])
    _assert(result.exit_code == 0, "exit code 0")
    _assert("Hi, Bob!" in result.output, "custom greeting")


def test_calc_sum() -> None:
    result = invoke(cli, ["calc", "1", "2", "3"])
    _assert(result.exit_code == 0, "exit code 0")
    _assert("6.0" in result.output, "sum=6")


def test_calc_avg() -> None:
    result = invoke(cli, ["calc", "--op", "avg", "10", "20"])
    _assert(result.exit_code == 0, "exit code 0")
    _assert("15.0" in result.output, "avg=15")


def test_read_json(tmp_path: Optional[Path] = None) -> None:
    runner = CliRunner()
    with runner.isolated_filesystem() as tmp_dir:
        path = Path(tmp_dir) / "data.json"
        path.write_text('{"key": "value"}')
        result = runner.invoke(cli, ["read", str(path), "--format", "json"])
        _assert(result.exit_code == 0, "exit code 0")
        _assert('"key"' in result.output, "json key in output")


def test_read_missing_file() -> None:
    result = invoke(cli, ["read", "/nonexistent/file.txt"])
    _assert(result.exit_code != 0, "non-zero exit for missing file")
    _assert("not found" in result.output.lower() or "error" in result.output.lower(), "error message")


def test_dangerous_with_yes() -> None:
    result = invoke(cli, ["dangerous"], input="y\n")
    _assert(result.exit_code == 0, "exit code 0 with yes")


def test_dangerous_with_no() -> None:
    result = invoke(cli, ["dangerous"], input="n\n")
    _assert(result.exit_code != 0, "non-zero exit with no")


def run_all_tests() -> None:
    print("CLI inline tests:")
    tests = [
        test_greet_default,
        test_greet_custom,
        test_calc_sum,
        test_calc_avg,
        test_read_json,
        test_read_missing_file,
        test_dangerous_with_yes,
        test_dangerous_with_no,
    ]
    for test_fn in tests:
        test_fn()
    print("All tests passed.")


# ===== 4. pytest 示例（注释形式）=====

# import pytest
#
# @pytest.fixture
# def runner():
#     return CliRunner(mix_stderr=False)
#
# def test_greet(runner):
#     result = runner.invoke(cli, ['greet', 'World'])
#     assert result.exit_code == 0
#     assert 'Hello, World!' in result.output
#
# @pytest.fixture
# def temp_json(tmp_path):
#     f = tmp_path / 'data.json'
#     f.write_text('{"name":"test"}')
#     return f
#
# def test_read_json_file(runner, temp_json):
#     result = runner.invoke(cli, ['read', str(temp_json), '--format', 'json'])
#     assert result.exit_code == 0
#     assert '"name"' in result.output


if __name__ == "__main__":
    run_all_tests()
