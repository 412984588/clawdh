# Python CLI Patterns

10 production-ready Python CLI patterns using Click and Typer — covering commands, config management, output formatting, async, testing, plugins, file operations, and interactive mode.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Click Basics | Commands, options, arguments, groups, file I/O, progress bar |
| 02 | Typer Basics | FastAPI-style CLI with type hints, sub-apps, callbacks |
| 03 | Config Management | TOML/JSON config, env vars, priority chain |
| 04 | Output Formatting | Tables, colors, progress bars, JSON/CSV output |
| 05 | Error Handling | Custom exceptions, exit codes, error decorators |
| 06 | Async Commands | asyncio integration, concurrent HTTP, batch processing |
| 07 | Testing CLI | CliRunner, pytest fixtures, stdin/stdout mocking |
| 08 | Plugins | Entry points, dynamic loading, plugin architecture |
| 09 | File Operations | Glob traversal, atomic write, streaming, checksums |
| 10 | Interactive Mode | Prompts, wizards, REPL, readline completion |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
pip install click typer
python templates/01-click-basics/cli.py --help
```

## Requirements

- Python 3.11+
- click 8.x
- typer 0.12+

## License

MIT — use in personal and commercial projects.
