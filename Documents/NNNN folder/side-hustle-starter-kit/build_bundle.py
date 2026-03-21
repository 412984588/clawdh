#!/usr/bin/env python3
"""Build distribution ZIPs for side-hustle-starter-kit."""

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
TIERS = json.loads((ROOT / "tiers.json").read_text())

DIST.mkdir(exist_ok=True)


def build_zip(tier: dict) -> None:
    zip_path = DIST / tier["zip_name"]
    templates = tier["templates"]
    tier_id = tier["id"]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname in ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]:
            fpath = ROOT / fname
            if fpath.exists():
                zf.write(fpath, fname)

        for tid in templates:
            tdir = ROOT / "templates" / tid
            if not tdir.exists():
                print(f"  WARNING: {tdir} not found, skipping")
                continue
            for fpath in sorted(tdir.rglob("*")):
                if fpath.is_file():
                    arcname = str(fpath.relative_to(ROOT))
                    zf.write(fpath, arcname)

    size_kb = zip_path.stat().st_size // 1024
    print(f"  [{tier_id}] {zip_path.name} — {size_kb}KB ({len(templates)} templates)")


def main() -> None:
    print("Building side-hustle-starter-kit bundles...\n")
    for tier in TIERS["tiers"]:
        build_zip(tier)
    print("\nDone. ZIPs are in dist/")


if __name__ == "__main__":
    main()
