# Changelog

## 1.2.0

- Themed keyboard-accessible notebook, status and sort menus replace native Windows selects.
- Smooth cursor opacity animation in normal writing and Vim, respecting reduced motion.
- Ctrl+T applies a template only to an empty note without changing its ID or overwriting content. Eight built-in templates cover studying, Cornell notes, clean code review, patterns, deployment, tasks, debugging and architecture decisions.
- Rendered preview export to standalone HTML and PDF with independent dark/light/Gruvbox theme and optional dates/backlink metadata. Markdown and JSON export remain available.
- Optional local Ollama prediction with explicit model selection, 950 ms typing pause, ghost text, Tab acceptance, Escape dismissal, cancellation and Vim insert-mode support. Loopback-only endpoint; cloud/remote models rejected. Preferences are stored separately from notes and backups.
- Schema remains version 1; creates immutable notes.before-v1.2.0.json before the first write to an existing collection. Versioned release preserves previous executables.

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
