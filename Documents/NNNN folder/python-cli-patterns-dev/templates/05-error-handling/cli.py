"""CLI 错误处理模式 — 自定义异常、退出码、用户友好错误、全局错误处理"""

import sys
import traceback
from functools import wraps
from pathlib import Path
from typing import Any, Callable, TypeVar

import click

# ===== 1. 退出码常量 =====

EXIT_OK = 0
EXIT_ERROR = 1
EXIT_VALIDATION_ERROR = 2
EXIT_NOT_FOUND = 3
EXIT_PERMISSION_DENIED = 4
EXIT_TIMEOUT = 124
EXIT_INTERRUPTED = 130

# ===== 2. 自定义异常 =====


class CliError(click.ClickException):
    """基础 CLI 异常，自动显示友好错误消息"""
    exit_code = EXIT_ERROR

    def show(self, file: Any = None) -> None:
        click.secho(f"Error: {self.format_message()}", fg="red", bold=True, err=True)


class ValidationError(CliError):
    """输入验证失败"""
    exit_code = EXIT_VALIDATION_ERROR

    def show(self, file: Any = None) -> None:
        click.secho(f"Validation error: {self.format_message()}", fg="yellow", err=True)


class NotFoundError(CliError):
    """资源未找到"""
    exit_code = EXIT_NOT_FOUND

    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(f"{resource} '{identifier}' not found")
        self.resource = resource
        self.identifier = identifier


class PermissionError(CliError):
    exit_code = EXIT_PERMISSION_DENIED


# ===== 3. 错误处理装饰器 =====

F = TypeVar("F", bound=Callable[..., Any])


def handle_errors(func: F) -> F:
    """捕获常见异常并转换为用户友好的 CLI 错误"""
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return func(*args, **kwargs)
        except click.ClickException:
            raise  # 已经是 ClickException，直接传播
        except KeyboardInterrupt:
            click.echo("\nInterrupted.", err=True)
            sys.exit(EXIT_INTERRUPTED)
        except FileNotFoundError as e:
            raise CliError(f"File not found: {e.filename}") from e
        except PermissionError as e:
            raise CliError(f"Permission denied: {e}") from e
        except TimeoutError as e:
            raise CliError(f"Operation timed out: {e}") from e
        except Exception as e:
            # 调试模式下显示完整 traceback
            if os.environ.get("APP_DEBUG"):
                traceback.print_exc()
            raise CliError(f"Unexpected error: {type(e).__name__}: {e}") from e
    return wrapper  # type: ignore[return-value]


import os

# ===== 4. 参数验证辅助 =====


def validate_positive(value: int, name: str = "Value") -> int:
    if value <= 0:
        raise ValidationError(f"{name} must be positive, got {value}")
    return value


def validate_file_exists(path: Path, name: str = "File") -> Path:
    if not path.exists():
        raise NotFoundError(name, path)
    if not path.is_file():
        raise ValidationError(f"{name} '{path}' is not a file")
    return path


def validate_dir_exists(path: Path, name: str = "Directory") -> Path:
    if not path.exists():
        raise NotFoundError(name, path)
    if not path.is_dir():
        raise ValidationError(f"{name} '{path}' is not a directory")
    return path


# ===== 5. CLI =====


@click.group()
@click.option("--debug/--no-debug", envvar="APP_DEBUG", default=False)
def cli(debug: bool) -> None:
    """Error handling patterns."""
    if debug:
        os.environ["APP_DEBUG"] = "1"


@cli.command()
@click.argument("count", type=int)
@handle_errors
def process(count: int) -> None:
    """Process COUNT items (validates input)."""
    validate_positive(count, "count")
    click.echo(f"Processing {count} items...")
    click.secho("✓ Done", fg="green")


@cli.command()
@click.argument("path", type=click.Path(path_type=Path))
@handle_errors
def read_file(path: Path) -> None:
    """Read and display a FILE."""
    validated = validate_file_exists(path, "Input file")
    click.echo(validated.read_text())


@cli.command()
@click.argument("user_id", type=int)
@handle_errors
def get_user(user_id: int) -> None:
    """Fetch user by USER_ID."""
    validate_positive(user_id, "user_id")
    # 模拟 404
    if user_id > 100:
        raise NotFoundError("User", user_id)
    click.echo(f"User #{user_id}: Alice")


@cli.command()
@click.argument("action", type=click.Choice(["ok", "error", "validation", "not-found"]))
def demo(action: str) -> None:
    """Demonstrate different error types."""
    if action == "error":
        raise CliError("Something went wrong")
    elif action == "validation":
        raise ValidationError("Invalid email format")
    elif action == "not-found":
        raise NotFoundError("Resource", "my-resource-id")
    else:
        click.secho("✓ Success!", fg="green")


if __name__ == "__main__":
    cli()
