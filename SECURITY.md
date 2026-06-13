# Security Policy

## Supported versions

Only the latest released version of Zotero Audit receives fixes. Please update to
the newest release before reporting an issue.

## Reporting a vulnerability

Please report security issues privately rather than opening a public issue:

- Use GitHub's **"Report a vulnerability"** button (Security tab → Privately report
  a vulnerability): <https://github.com/jsglazer/zotero-audit/security/advisories/new>
- or open a regular issue **without** sensitive details and ask for a private channel.

Please include reproduction steps and the plugin version (see `manifest.json`). We aim
to acknowledge reports within 14 days and to release a fix in a subsequent version.

## Scope & threat model

Zotero Audit is a bootstrapped Zotero extension. It reads your **local** Zotero
library and presents a table of items so you can check and edit essential metadata
fields in place.

- The plugin makes **no network requests** (the only URL it shows is a link to this
  GitHub repository in an install message) and adds no telemetry.
- It operates entirely on your local Zotero data through Zotero's own APIs; nothing
  leaves your machine.
