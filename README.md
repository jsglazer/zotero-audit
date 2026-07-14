# Zotero Audit

[![GitHub release](https://img.shields.io/github/v/release/jsglazer/zotero-audit?logo=github)](https://github.com/jsglazer/zotero-audit/releases) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/jsglazer/zotero-audit/blob/main/LICENSE) [![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97756?logo=anthropic)](https://claude.ai) [![Gemini Flash Antigravity](https://img.shields.io/badge/Gemini%20Flash-Antigravity-4f86f7?logo=google-gemini&logoColor=white)](https://github.com/google-gemini) [![CI](https://github.com/jsglazer/zotero-audit/actions/workflows/ci.yml/badge.svg)](https://github.com/jsglazer/zotero-audit/actions/workflows/ci.yml) [![CodeQL](https://github.com/jsglazer/zotero-audit/actions/workflows/codeql.yml/badge.svg)](https://github.com/jsglazer/zotero-audit/actions/workflows/codeql.yml) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jsglazer/zotero-audit/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jsglazer/zotero-audit)

A Zotero 7/9 plugin that opens a full-library metadata table you can browse, sort, and edit in place.

## Features

- **Spreadsheet-style view** of every regular item in your library
- **Inline editing** — click any cell and type; changes save to Zotero on blur
- **Live sync** — edits made in the main Zotero window while the table is open refresh the affected rows automatically (a cell you're actively editing is never overwritten)
- **Open-in-Zotero arrow** — the → button on each row selects that item in the main window and highlights blue so you can see which row you last jumped to (only one at a time)
- **Column sort** — click any header to sort ascending; click again to reverse
- **Citation ID column** — reads auto-generated and pinned keys from [Better BibTeX](https://retorque.re/zotero-better-bibtex/) (falls back to `Citation Key:` in the Extra field)
- **Color-coded cells** — green = value present, red = value missing
- **Version in window title** — the dialog title shows the running plugin version, e.g. "Zotero Audit (1.0.14)"

### Columns

| Column | Zotero field |
|---|---|
| Content Type | Item type (e.g. journalArticle, book) |
| Citation ID | BBT citation key |
| Title | Title |
| Short Title | Short title |
| Author | First creator (Last, First) |
| Year | Year portion of the date field |
| Month | Month portion of the date field (01–12) |

## Requirements

- Zotero 7.0.0 or later (Zotero 9 supported)
- [Better BibTeX for Zotero](https://retorque.re/zotero-better-bibtex/) (optional — required for the Citation ID column)

## Installation

1. Download `zotero-audit.xpi` from [releases](https://github.com/jsglazer/zotero-audit/releases)
2. In Zotero: **Tools → Add-ons → gear icon → Install Add-on From File…**
3. Select the `.xpi` file and restart Zotero

## Usage

**Tools → Audit Library…** or press **⌥⌘A**

| Shortcut | Action |
|---|---|
| ⌥⌘A | Open Audit Library dialog |
| ⌘W | Close the dialog |

The dialog opens with all library items loaded. The status bar at the bottom shows the item count, citation key count, and any BBT diagnostic messages.

### Editing

- Click a cell to edit
- Tab or click away to save
- The cell turns green/red immediately; "Saving…" appears in the status bar while the write completes
- Edits you make to the same item in the main Zotero window appear in the table automatically, without reopening it

### Opening an item in Zotero

Click the → arrow at the end of a row to select that item in the main Zotero window. The arrow turns blue to mark the row you last opened; clicking another row's arrow moves the highlight there, so only one is ever blue at a time.

### Sorting

- Click any column header to sort ascending (↑)
- Click again to reverse (↓)

### Author format

Enter authors as `Last, First` (comma-separated). Single-word entries are saved as institutional/single-name creators.

### Citation ID

If Better BibTeX is installed, the Citation ID column shows BBT's auto-generated or pinned key. Without BBT, it falls back to a `Citation Key: <key>` line in the item's Extra field.

## Building from source

```bash
git clone https://github.com/jsglazer/zotero-audit.git
cd zotero-audit
bash build.sh
# produces zotero-audit.xpi
```

Requires `zip` (standard on macOS/Linux).

## License

MIT
