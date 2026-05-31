#!/usr/bin/env bash
# Packages zotero-audit.xpi — files must be at the archive root, not inside a folder.
set -e
cd "$(dirname "$0")"
rm -f zotero-audit.xpi
zip zotero-audit.xpi manifest.json bootstrap.js chrome.manifest LICENSE
zip zotero-audit.xpi chrome/content/audit.html
echo "Built zotero-audit.xpi"
