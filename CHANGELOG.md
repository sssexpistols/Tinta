# Changelog

## 1.5.0

- Synchronizes the Markdown editor when switching read-only templates and trashed notes, preserving editable-note history and preventing content writes while browsing.
- Hover and keyboard-focus template previews in both the library and picker. All 17 built-in worksheets now include tailored investigation, worked examples, decision tables and follow-up guidance; personal templates and previously created notes remain untouched.
- Empty Trash from its sidebar context menu or panel button, with counted confirmation and cancellation. Deletes only confirmed IDs still in trash, including search-hidden notes.
- Diagram clipboard PNG has a transparent canvas while preserving the selected node palette and the in-app backdrop.
- Preview code wraps by default; line-number gutters track each wrapped source line. Clipboard code preserves original whitespace and excludes UI metadata. Multiline syntax tokens stay correctly styled.
- Compatible schema 1 and immutable notes.before-v1.5.0.json. Prior releases and local Ollama settings remain unchanged.

## 1.4.0

- Preview controls copy code without line numbers, copy Mermaid source or a PNG image, zoom, pan, reset and open a focused diagram dialog. Controls follow the theme and stay out of HTML/PDF exports.
- App shortcuts take priority over Vim. Ctrl+N works in insert and visual modes; Markdown formatting, undo/redo and local search are configurable alongside app shortcuts. Existing custom combinations take priority over newly introduced editor defaults.
- Prediction distinguishes prose from the current fenced language before truncating context, including quoted fences. Nearby cues allow Markdown lists, examples and Mermaid. Filters wrong-language code, repeated context and echoed prefixes; accepting a suggestion no longer starts an automatic request chain.
- Compared local qwen2.5-coder:3b and qwen2.5:7b on synthetic Spanish, Git, SQL and diagram examples. Selected the general 7B model on this machine and retained the old model and configuration backup.
- Preserves note schema 1, creates immutable notes.before-v1.4.0.json on upgrade, and keeps prior release executables unchanged.

## 1.3.0

- Template library exposes 17 built-in templates in searchable categories alongside editable personal templates; empty notes offer a template button. Adds codebase exploration, performance improvement, hang/bug/dependency reports, reading summaries, concept deep dives, feature and refactoring plans.
- Inline tag entry with Enter and suggestions; themed note context menu for move, duplicate, pin, copy reference, export and trash/restore.
- Local Mermaid rendering with theme support, sanitized SVG, error fallback and rendered HTML/PDF export. Code fences support filename, title and starting line metadata.
- Configurable app shortcuts with conflict checks, reserved editing keys, persistence and reset. Dialog exit animations and reduced-motion support. Visible version badge.
- Local Ollama output normalization handles prose spacing and redundant code fences. Explicit 4096-token context and five-minute model keep-alive.
- Preserves schema 1 and immutable notes.before-v1.3.0.json. Prior executables remain unchanged.

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
