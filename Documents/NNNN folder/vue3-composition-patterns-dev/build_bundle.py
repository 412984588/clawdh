"""Build distribution ZIPs for vue3-composition-patterns-dev."""

import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
TEMPLATES = ROOT / "templates"

TIERS = json.loads((ROOT / "tiers.json").read_text())

ROOT_FILES = ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]


def build_zip(tier: dict) -> None:
    DIST.mkdir(exist_ok=True)
    zip_path = DIST / tier["zip_name"]
    template_ids: list = tier["templates"]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname in ROOT_FILES:
            src = ROOT / fname
            if src.exists():
                zf.write(src, fname)

        for tpl_id in template_ids:
            tpl_dir = TEMPLATES / tpl_id
            if not tpl_dir.is_dir():
                print(f"  WARNING: missing template dir {tpl_id}")
                continue
            for fpath in sorted(tpl_dir.rglob("*")):
                if fpath.is_file():
                    arcname = f"templates/{tpl_id}/{fpath.relative_to(tpl_dir)}"
                    zf.write(fpath, arcname)

    print(f"  Built: {zip_path.name} ({zip_path.stat().st_size // 1024} KB)")


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for tier in TIERS["tiers"]:
        print(f"Building {tier['id']} tier...")
        build_zip(tier)

    print("Done.")


if __name__ == "__main__":
    main()
