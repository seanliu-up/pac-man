#!/usr/bin/env python3
"""
Reads all wiki feature pages and outputs a structured JSON summary.
Usage: python3 collect_wiki_features.py <wiki_dir>
"""
import json
import os
import re
import sys


def extract_sections(text):
    """Extract title, overview, and source spec path from a wiki feature page."""
    title = ""
    overview = ""
    source_spec = ""

    # H1 title
    for line in text.splitlines():
        m = re.match(r'^#\s+(.+)', line)
        if m:
            title = m.group(1).strip()
            break

    # Source spec path from the > line
    m = re.search(r'\[`(specs/[^`]+)`\]', text)
    if m:
        source_spec = m.group(1)

    # Overview section (text between ## Overview and the next ##)
    m = re.search(r'## Overview\s*\n(.*?)(?=\n##|\Z)', text, re.DOTALL)
    if m:
        overview = m.group(1).strip()

    return title, overview, source_spec


def main():
    wiki_dir = sys.argv[1] if len(sys.argv) > 1 else "wiki"
    features_dir = os.path.join(wiki_dir, "features")

    if not os.path.isdir(features_dir):
        print(json.dumps({"error": f"Directory not found: {features_dir}"}))
        sys.exit(1)

    features = []
    for fname in sorted(os.listdir(features_dir)):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(features_dir, fname)
        with open(fpath, encoding="utf-8") as f:
            text = f.read()
        title, overview, source_spec = extract_sections(text)
        features.append({
            "wiki_file": f"wiki/features/{fname}",
            "folder": fname[:-3],  # strip .md
            "title": title,
            "overview": overview,
            "source_spec": source_spec,
        })

    print(json.dumps({"features": features}, indent=2))


if __name__ == "__main__":
    main()
