#!/usr/bin/env bash
# Packages zotero-audit.xpi — files must be at the archive root, not inside a folder.
set -e
cd "$(dirname "$0")"
rm -f zotero-audit.xpi
zip zotero-audit.xpi manifest.json bootstrap.js chrome.manifest audit.html LICENSE
echo "Built zotero-audit.xpi"
