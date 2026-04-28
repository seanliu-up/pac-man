#!/usr/bin/env python3
"""
Scan a specs directory and report which feature folders need wiki processing.

Classifies each folder as:
  - "regular": contains spec.md → track only spec.md and plan.md
  - "simple":  no spec.md      → track each .md file individually

Usage:
    python3 scan_features.py <specs-dir>

Output (JSON to stdout):
    {
      "needs_processing": [
        {"folder": "001-feature", "type": "regular"},
        {"folder": "tiny", "type": "simple", "files": ["speed-5x-1x-default.md"]}
      ],
      "up_to_date": [
        {"folder": "002-feature", "type": "regular"},
        {"folder": "tiny", "type": "simple"}
      ],
      "total": 3
    }

For regular folders: the whole folder needs processing (spec.md or plan.md changed).
For simple folders: only the specific .md files that changed are listed in "files".
  A simple folder only appears in "up_to_date" when ALL its files are up to date.
"""

import json
import sys
from pathlib import Path


def classify(folder: Path) -> str:
    """Return 'regular' if folder has spec.md, 'simple' otherwise."""
    return "regular" if (folder / "spec.md").exists() else "simple"


def get_mtimes(folder: Path, filenames: list[str]) -> dict[str, int]:
    """Return {filename: mtime_epoch} for each filename that exists."""
    result = {}
    for name in filenames:
        p = folder / name
        if p.exists():
            result[name] = int(p.stat().st_mtime)
    return result


def all_md_mtimes(folder: Path) -> dict[str, int]:
    """Return {filename: mtime_epoch} for all .md files in folder."""
    return {
        f.name: int(f.stat().st_mtime)
        for f in sorted(folder.iterdir())
        if f.is_file() and f.suffix == ".md"
    }


def check_regular(folder: Path, stored: dict) -> bool:
    """Return True if spec.md or plan.md changed since last processed."""
    stored_mtimes: dict = stored.get("fileMtimes", {})

    # Legacy format migration
    if not stored_mtimes:
        spec_m = stored.get("specMtime")
        plan_m = stored.get("planMtime")
        if spec_m is not None:
            stored_mtimes["spec.md"] = spec_m
        if plan_m is not None:
            stored_mtimes["plan.md"] = plan_m

    current = get_mtimes(folder, ["spec.md", "plan.md"])

    for fname, cur_mtime in current.items():
        stored_mtime = stored_mtimes.get(fname)
        if stored_mtime is None or cur_mtime > stored_mtime:
            return True

    return False


def changed_simple_files(folder: Path, stored: dict) -> list[str]:
    """Return list of .md files that are new or changed since last processed."""
    stored_mtimes: dict = stored.get("fileMtimes", {})
    current = all_md_mtimes(folder)
    changed = []

    for fname, cur_mtime in current.items():
        stored_mtime = stored_mtimes.get(fname)
        if stored_mtime is None or cur_mtime > stored_mtime:
            changed.append(fname)

    return changed


def scan_folder(folder: Path) -> tuple[str, str, list[str]]:
    """
    Returns (folder_type, status, changed_files):
      folder_type: "regular" or "simple"
      status:      "needs_processing" or "up_to_date"
      changed_files: list of files needing processing (simple folders only)
    """
    folder_type = classify(folder)
    status_file = folder / ".wiki-processed.json"

    if not status_file.exists():
        if folder_type == "regular":
            return folder_type, "needs_processing", []
        else:
            files = list(all_md_mtimes(folder).keys())
            return folder_type, "needs_processing", files

    try:
        stored = json.loads(status_file.read_text())
    except (json.JSONDecodeError, OSError):
        if folder_type == "regular":
            return folder_type, "needs_processing", []
        else:
            files = list(all_md_mtimes(folder).keys())
            return folder_type, "needs_processing", files

    if folder_type == "regular":
        if check_regular(folder, stored):
            return folder_type, "needs_processing", []
        return folder_type, "up_to_date", []
    else:
        changed = changed_simple_files(folder, stored)
        if changed:
            return folder_type, "needs_processing", changed
        return folder_type, "up_to_date", []


def main():
    if len(sys.argv) < 2:
        print("Usage: scan_features.py <specs-dir>", file=sys.stderr)
        sys.exit(1)

    specs_dir = Path(sys.argv[1])
    if not specs_dir.is_dir():
        print(f"Error: {specs_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    needs = []
    up_to_date = []

    for folder in sorted(specs_dir.iterdir()):
        if not folder.is_dir():
            continue

        folder_type, status, changed_files = scan_folder(folder)

        if status == "needs_processing":
            if folder_type == "simple":
                needs.append({"folder": folder.name, "type": folder_type, "files": changed_files})
            else:
                needs.append({"folder": folder.name, "type": folder_type})
        else:
            up_to_date.append({"folder": folder.name, "type": folder_type})

    print(json.dumps({
        "needs_processing": needs,
        "up_to_date": up_to_date,
        "total": len(needs) + len(up_to_date)
    }, indent=2))


if __name__ == "__main__":
    main()
