"""
Build TanStack Query Patterns Pack ZIPs — one per tier.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent
DIST_DIR = PRODUCT_DIR / "dist"
TEMPLATES_DIR = PRODUCT_DIR / "templates"

ROOT_FILES = ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]


def build_tier(tier: dict) -> None:
    DIST_DIR.mkdir(exist_ok=True)
    zip_path = DIST_DIR / tier["zip_name"]

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for f in ROOT_FILES:
            zf.write(PRODUCT_DIR / f, f)
        for tpl_name in tier["templates"]:
            tpl_dir = TEMPLATES_DIR / tpl_name
            for file in sorted(tpl_dir.rglob("*")):
                if file.is_file():
                    arcname = f"templates/{tpl_name}/{file.relative_to(tpl_dir)}"
                    zf.write(file, arcname)

    size_kb = zip_path.stat().st_size / 1024
    print(f"  Built {zip_path.name} ({size_kb:.0f} KB) — {len(tier['templates'])} patterns")


def main() -> None:
    tiers_data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    print(f"Building {tiers_data['product']} v{tiers_data['version']}")
    for tier in tiers_data["tiers"]:
        build_tier(tier)
    print("Done.")


if __name__ == "__main__":
    main()
