"""
Build all bundle ZIPs.
"""

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent
BUNDLES_DIR = REPO_ROOT / "bundles"


def main():
    for bundle_dir in sorted(BUNDLES_DIR.iterdir()):
        if not bundle_dir.is_dir():
            continue
        build_script = bundle_dir / "build_bundle.py"
        if not build_script.exists():
            print(f"  SKIP {bundle_dir.name} (no build_bundle.py)")
            continue
        print(f"\n=== {bundle_dir.name} ===")
        result = subprocess.run(
            [sys.executable, str(build_script)],
            capture_output=False,
        )
        if result.returncode != 0:
            print(f"  ERROR: {bundle_dir.name} build failed")
            sys.exit(1)
    print("\nAll bundles built.")


if __name__ == "__main__":
    main()
