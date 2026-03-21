#!/usr/bin/env python3
"""Build distribution ZIPs for Fastify Patterns Dev Pack."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

with open(ROOT / "tiers.json") as f:
    config = json.load(f)

for tier in config["tiers"]:
    zip_path = DIST / tier["zip_name"]
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for tmpl in tier["templates"]:
            tmpl_dir = ROOT / "templates" / tmpl
            for file in tmpl_dir.rglob("*"):
                if file.is_file():
                    zf.write(file, f"templates/{tmpl}/{file.name}")

        for fname in ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]:
            fpath = ROOT / fname
            if fpath.exists():
                zf.write(fpath, fname)

    size_kb = zip_path.stat().st_size // 1024
    print(f"Built {zip_path.name} ({size_kb} KB) — {len(tier['templates'])} templates")

print("Done.")
