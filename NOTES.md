# Notes

## MCP server and permission rule
I connected the `fetch` server (`uvx mcp-server-fetch`, configured in `.mcp.json`). It lets Claude pull in web pages, such as Express or Node documentation, so answers about this API can rest on the current docs instead of memory. The rule `mcp__fetch__fetch` under `permissions.allow` in `.claude/settings.json` lets Claude call that one read-only tool without a prompt each time. It allows nothing else: the server's other tools and any MCP resource tools still ask first.

## Skill
The `docline` skill captures a habit: every new function gets a one-line JSDoc comment above it. Its description says what it does and when to use it ("Use whenever you write or add a function, handler, or helper in this codebase, or when asked to document new functions"). That wording ties it to the moment of writing a function, so it fires without being named. The skill also states what to skip, such as inline callbacks and existing functions, so it doesn't over-trigger.

## Command
I added `/summarize-changes` (`.claude/commands/summarize-changes.md`). It gathers the working-tree status, the uncommitted diff, the branch's commits and the diff against `main` (or a base branch passed as an argument), then writes a short summary with an overview, changes by area, uncommitted work and risks. It's worth a shortcut because I would otherwise retype the same four git commands and the same output structure before every commit or PR. It can only run `git status`, `git diff` and `git log`, so it can't change anything.

## Hook
The hook runs on the `PostToolUse` event, matched to `Edit|Write`, so it reacts after a file has been changed. `.claude/hooks/check-standards.js` checks the edited file against the standards in `CLAUDE.md`: it runs ESLint with the project config, and in `routes/` it flags error responses that aren't `.json({ error: '...' })` and route files that hold state instead of using `db/store.js`. On a failure it exits with code 2 and prints the problems, so Claude sees them and fixes them. It never edits files. It only looks at `.js` files in `server.js`, `routes/`, `db/` and `tests/`.

## Headless
**Task:** summarize what changed on the branch against `main`, using the `/summarize-changes` command. It is read-only, so it is safe to run unattended (for example in CI).

**Invocation:**
```
claude -p "/summarize-changes main" \
  --allowedTools "Bash(git status:*)" "Bash(git diff:*)" "Bash(git log:*)" "Read"
```

**Allowed tools and why:**
- `Bash(git status:*)`, `Bash(git diff:*)` and `Bash(git log:*)`: the command gathers its facts with exactly these three git commands, and nothing else is needed.
- `Read`: lets it open changed files when the diff stats aren't enough to explain a change.

Nothing else is allowed. There is no `Edit`, `Write`, general `Bash`, or network access, so a headless run can't change files, commit, push or call out. In `-p` mode any tool not on the list is denied instead of prompting. The run compared against `main` and reported the uncommitted work correctly, which also shows the base-branch argument reaches the git commands.

## Changes
Changes on `feature/new-work`, compared with `main`:
- `.mcp.json`: adds the `fetch` MCP server.
- `.claude/settings.json`: allows `mcp__fetch__fetch` and registers the `PostToolUse` hook.
- `.claude/skills/docline/SKILL.md`: the `docline` skill.
- `.claude/commands/summarize-changes.md`: the `/summarize-changes` command, which takes an optional base branch.
- `.claude/hooks/check-standards.js`: the standards-check hook script.
- `NOTES.md`: these notes.
