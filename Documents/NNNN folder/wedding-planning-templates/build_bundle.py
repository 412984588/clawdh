"""Build ZIP bundles for wedding-planning-templates."""

from __future__ import annotations

import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
TIERS = json.loads((ROOT / "tiers.json").read_text(encoding="utf-8"))
ROOT_FILES = ["README.md", "tiers.json", "LICENSE", "CHANGELOG.md"]


def build_zip(tier: dict[str, object]) -> None:
    """Build one customer ZIP for the requested tier."""
    zip_path = DIST / str(tier["zip_name"])
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for file_name in ROOT_FILES:
            file_path = ROOT / file_name
            if file_path.exists():
                archive.write(file_path, file_name)

        for template_id in tier["templates"]:
            template_dir = ROOT / "templates" / str(template_id)
            if template_dir.exists():
                for file_path in sorted(template_dir.rglob("*")):
                    if file_path.is_file():
                        archive.write(file_path, str(file_path.relative_to(ROOT)))

    size_kb = zip_path.stat().st_size // 1024
    print(f"Built {zip_path.name} ({size_kb} KB, {len(tier['templates'])} templates)")


if __name__ == "__main__":
    for bundle_tier in TIERS["tiers"]:
        build_zip(bundle_tier)
    print("Done.")
