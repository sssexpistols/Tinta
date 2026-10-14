# Changelog

## 1.1.0

- `[[...]]` offers to create a missing note, including titles containing spaces. Completion inserts a persistent reference and keeps the source note open for writing.
- Linked text is styled in blue/aqua inside the editor, with readable titles instead of internal identifiers. Click a link or use Ctrl+Enter to open it. The target shows clickable backlinks under its dates.
- New references survive title changes; legacy references are converted to stable references when renaming. Code examples are excluded from backlink discovery.
- Added optional Vim editing with normal, insert and visual modes, command line, `:w`, block cursor, active line and relative line numbers.
- Added Gruvbox across navigation, editor, preview, menus and preferences. Refined transitions with reduced-motion support.
- Additive preferences preserve schema version 1 and the old dark/light field. First load of an existing collection creates `notes.before-v1.1.0.json` without overwriting an earlier snapshot.
- Established a local Git workflow with baseline tag v1.0.0, feature worktree, tested merge and versioned releases. Previous executable remains available.

## 1.0.0

Initial local Windows Markdown app with notebooks, tags, status, templates, trash, import/export, backups, split view and basic autocomplete.
