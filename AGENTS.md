# Tinta development workflow

The user uses the released desktop app for personal notes. Preserve the running release while making changes.

- Keep `main` as the tested release branch. Create a feature branch in a separate Git worktree before editing. Do not develop directly on main.
- Use isolated `TINTA_DATA_DIR` directories for all automated/manual development tests. Never run tests on the user's `%APPDATA%/Tinta` collection.
- Keep saved-note schema backward compatible where practical. Validate old-format data and create an immutable pre-upgrade snapshot before changing user data. Never silently seed over an unreadable collection.
- Build releases into versioned directories. Do not overwrite an older release, its ZIP, or an executable the user may be running.
- Run relevant storage, wiki and desktop interaction tests before committing and merging. Regression tests must protect user-visible behavior, not merely duplicate code.
- Commit coherent changes on the feature branch. After required tests pass, merge with `--no-ff` and create a version tag. The user has authorized this local release workflow; no automatic remote push or publishing is authorized.
- Keep source and dependency lockfile in Git. Exclude user notes, runtime caches, node_modules, test data and generated binaries. Update CHANGELOG and release instructions with behavior and compatibility details.
- Plugins remain postponed. Local Ollama prediction is optional and must remain disabled until the user configures it. Never send notes to cloud providers.
