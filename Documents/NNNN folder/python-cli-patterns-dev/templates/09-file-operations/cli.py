"""CLI 文件操作模式 — 目录遍历、Glob 匹配、流式大文件、原子写入"""

import hashlib
import shutil
import tempfile
from pathlib import Path
from typing import Generator, Iterator

import click

# ===== 1. 目录遍历辅助 =====


def walk_files(
    root: Path,
    pattern: str = "**/*",
    include_hidden: bool = False,
) -> Generator[Path, None, None]:
    """递归遍历目录，支持 glob 模式"""
    for path in sorted(root.glob(pattern)):
        if not path.is_file():
            continue
        if not include_hidden and any(p.startswith(".") for p in path.parts):
            continue
        yield path


def get_dir_size(path: Path) -> int:
    """递归计算目录大小（字节）"""
    return sum(f.stat().st_size for f in path.rglob("*") if f.is_file())


def human_size(size: int) -> str:
    """字节 → 人类可读格式"""
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size //= 1024
    return f"{size:.1f} PB"


# ===== 2. 原子文件写入 =====


def atomic_write(path: Path, content: str | bytes, mode: str = "w") -> None:
    """原子写入：先写临时文件再重命名，防止写入中途崩溃导致文件损坏"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode=mode,
        dir=path.parent,
        prefix=f".{path.name}.",
        delete=False,
        suffix=".tmp",
    ) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(path)


# ===== 3. 流式处理大文件 =====


def stream_lines(path: Path, chunk_size: int = 8192) -> Iterator[str]:
    """流式逐行读取大文件，不将整个文件载入内存"""
    with path.open("r", buffering=chunk_size) as f:
        for line in f:
            yield line.rstrip("\n")


def file_checksum(path: Path, algorithm: str = "sha256") -> str:
    """流式计算文件校验和"""
    h = hashlib.new(algorithm)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ===== 4. 安全删除（移到回收站）=====


def safe_delete(path: Path, trash_dir: Path | None = None) -> Path:
    """移动到临时垃圾桶而非直接删除"""
    trash = trash_dir or (Path.home() / ".cli_trash")
    trash.mkdir(parents=True, exist_ok=True)
    dest = trash / path.name
    # 避免同名冲突
    counter = 1
    while dest.exists():
        dest = trash / f"{path.stem}_{counter}{path.suffix}"
        counter += 1
    shutil.move(str(path), dest)
    return dest


# ===== 5. CLI =====


@click.group()
def cli() -> None:
    """File operation patterns."""


@cli.command()
@click.argument("directory", type=click.Path(exists=True, path_type=Path, file_okay=False))
@click.option("--pattern", default="**/*", show_default=True, help="Glob pattern.")
@click.option("--hidden/--no-hidden", default=False, help="Include hidden files.")
@click.option("--sort", type=click.Choice(["name", "size", "ext"]), default="name")
def ls(directory: Path, pattern: str, hidden: bool, sort: str) -> None:
    """List files matching PATTERN in DIRECTORY."""
    files = list(walk_files(directory, pattern, include_hidden=hidden))

    if sort == "size":
        files.sort(key=lambda f: f.stat().st_size, reverse=True)
    elif sort == "ext":
        files.sort(key=lambda f: f.suffix)

    for f in files:
        size = human_size(f.stat().st_size)
        rel = f.relative_to(directory)
        click.echo(f"  {size:>10}  {rel}")

    total = sum(f.stat().st_size for f in files)
    click.echo(f"\n{len(files)} files, {human_size(total)} total")


@cli.command()
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.option("--algorithm", type=click.Choice(["md5", "sha1", "sha256", "sha512"]), default="sha256")
def checksum(path: Path, algorithm: str) -> None:
    """Calculate checksum of PATH."""
    if path.is_dir():
        raise click.ClickException("Cannot checksum a directory")
    digest = file_checksum(path, algorithm)
    click.echo(f"{algorithm}:{digest}  {path.name}")


@cli.command()
@click.argument("path", type=click.Path(exists=True, path_type=Path))
def disk_usage(path: Path) -> None:
    """Show disk usage of PATH."""
    if path.is_file():
        click.echo(f"{human_size(path.stat().st_size)}  {path}")
    else:
        size = get_dir_size(path)
        count = sum(1 for _ in path.rglob("*") if _.is_file())
        click.echo(f"{human_size(size)}  {path}  ({count} files)")


@cli.command()
@click.argument("source", type=click.Path(exists=True, path_type=Path))
@click.argument("dest", type=click.Path(path_type=Path))
@click.option("--force/--no-force", default=False, help="Overwrite if destination exists.")
def cp(source: Path, dest: Path, force: bool) -> None:
    """Copy SOURCE to DEST (atomic write for files)."""
    if dest.exists() and not force:
        raise click.ClickException(f"Destination exists: {dest}. Use --force to overwrite.")
    if source.is_file():
        atomic_write(dest, source.read_bytes(), mode="wb")
        click.secho(f"✓ Copied {source} → {dest}", fg="green")
    elif source.is_dir():
        shutil.copytree(source, dest, dirs_exist_ok=force)
        click.secho(f"✓ Copied directory {source} → {dest}", fg="green")


@cli.command()
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.option("--trash-dir", type=click.Path(path_type=Path), default=None)
def rm(path: Path, trash_dir: Path | None) -> None:
    """Safely remove PATH (moves to trash, not permanent delete)."""
    dest = safe_delete(path, trash_dir)
    click.secho(f"✓ Moved to trash: {dest}", fg="yellow")


if __name__ == "__main__":
    cli()
