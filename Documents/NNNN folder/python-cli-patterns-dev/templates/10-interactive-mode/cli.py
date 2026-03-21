"""CLI 交互模式 — prompt、confirm、菜单、readline 补全、REPL"""

import sys
from typing import Any, Callable, Optional

import click

# ===== 1. 丰富的 Prompt 辅助 =====


def prompt_with_default(
    prompt_text: str,
    default: str = "",
    validator: Optional[Callable[[str], bool]] = None,
    error_msg: str = "Invalid input, try again.",
    max_retries: int = 3,
) -> str:
    """带重试的 prompt"""
    for attempt in range(max_retries):
        value = click.prompt(prompt_text, default=default or None)
        if validator is None or validator(value):
            return value
        remaining = max_retries - attempt - 1
        click.secho(f"{error_msg} ({remaining} retries left)", fg="yellow", err=True)
    raise click.ClickException(f"Max retries ({max_retries}) exceeded")


def prompt_password(confirm: bool = True) -> str:
    """安全密码 prompt（带确认）"""
    password = click.prompt("Password", hide_input=True)
    if confirm:
        confirm_pw = click.prompt("Confirm password", hide_input=True)
        if password != confirm_pw:
            raise click.ClickException("Passwords do not match")
    return password


def prompt_choice(prompt_text: str, choices: list[str]) -> str:
    """数字选单 prompt"""
    click.echo(f"\n{prompt_text}")
    for i, choice in enumerate(choices, 1):
        click.echo(f"  {i}. {choice}")
    while True:
        raw = click.prompt(f"Choose [1-{len(choices)}]")
        try:
            idx = int(raw) - 1
            if 0 <= idx < len(choices):
                return choices[idx]
        except ValueError:
            pass
        click.secho("Invalid choice.", fg="yellow")


# ===== 2. 简易 REPL =====


class SimpleRepl:
    """单循环 REPL（读取-求值-打印）"""

    def __init__(self, prompt: str = ">>> ") -> None:
        self.prompt = prompt
        self._commands: dict[str, Callable[[list[str]], Optional[bool]]] = {}
        self.running = False

    def command(self, name: str) -> Callable:
        """注册 REPL 命令"""
        def decorator(fn: Callable) -> Callable:
            self._commands[name] = fn
            return fn
        return decorator

    def run(self) -> None:
        self.running = True
        while self.running:
            try:
                raw = input(self.prompt).strip()
                if not raw:
                    continue
                parts = raw.split()
                cmd, args = parts[0], parts[1:]
                handler = self._commands.get(cmd)
                if handler:
                    result = handler(args)
                    if result is False:
                        self.running = False
                else:
                    click.secho(f"Unknown command: {cmd}. Type 'help' for commands.", fg="yellow")
            except (KeyboardInterrupt, EOFError):
                click.echo("\nExiting.")
                self.running = False
            except Exception as exc:
                click.secho(f"Error: {exc}", fg="red", err=True)

    def stop(self) -> None:
        self.running = False


# ===== 3. readline 自动补全 =====

def setup_readline_completer(completions: list[str]) -> None:
    """在支持 readline 的平台上设置 tab 补全"""
    try:
        import readline

        def completer(text: str, state: int) -> Optional[str]:
            matches = [c for c in completions if c.startswith(text)]
            return matches[state] if state < len(matches) else None

        readline.set_completer(completer)
        readline.parse_and_bind("tab: complete")
    except ImportError:
        pass  # Windows 无 readline


# ===== 4. CLI =====


@click.group()
def cli() -> None:
    """Interactive CLI patterns."""


@cli.command()
def wizard() -> None:
    """Interactive setup wizard."""
    click.echo("\n=== Setup Wizard ===\n")

    name = prompt_with_default(
        "Your name",
        validator=lambda v: len(v.strip()) >= 2,
        error_msg="Name must be at least 2 characters.",
    )

    email = prompt_with_default(
        "Email address",
        validator=lambda v: "@" in v and "." in v.split("@")[-1],
        error_msg="Please enter a valid email address.",
    )

    role = prompt_choice("Select role", ["Admin", "Developer", "Viewer"])

    env = click.prompt(
        "Environment",
        type=click.Choice(["development", "staging", "production"], case_sensitive=False),
        default="development",
    )

    confirm = click.confirm(f"\nCreate account for {name} <{email}>?", default=True)
    if not confirm:
        raise click.Abort()

    click.echo("")
    click.secho("✓ Account created:", fg="green", bold=True)
    click.echo(f"  Name:        {name}")
    click.echo(f"  Email:       {email}")
    click.echo(f"  Role:        {role}")
    click.echo(f"  Environment: {env}")


@cli.command()
def repl() -> None:
    """Start an interactive REPL session."""
    repl_instance = SimpleRepl(prompt="myapp> ")
    setup_readline_completer(["help", "ping", "echo", "exit", "quit"])

    @repl_instance.command("help")
    def cmd_help(_args: list[str]) -> None:
        click.echo("Commands: help, ping, echo <text>, exit")

    @repl_instance.command("ping")
    def cmd_ping(_args: list[str]) -> None:
        click.secho("pong", fg="green")

    @repl_instance.command("echo")
    def cmd_echo(args: list[str]) -> None:
        click.echo(" ".join(args))

    @repl_instance.command("exit")
    def cmd_exit(_args: list[str]) -> bool:
        return False

    @repl_instance.command("quit")
    def cmd_quit(_args: list[str]) -> bool:
        return False

    click.echo("Interactive REPL — type 'help' or 'exit'")
    repl_instance.run()


@cli.command()
def demo_prompts() -> None:
    """Demonstrate various prompt patterns."""
    click.echo("=== Prompt Patterns Demo ===")

    # 数字选单
    lang = prompt_choice("Preferred language", ["Python", "TypeScript", "Rust", "Go"])
    click.echo(f"Selected: {lang}")

    # 确认
    if click.confirm("Continue?", default=True):
        click.secho("Continuing...", fg="cyan")
    else:
        raise click.Abort()


if __name__ == "__main__":
    cli()
