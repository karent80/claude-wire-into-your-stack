# Notes

## MCP server and permission rule
I connected the `fetch` server (`uvx mcp-server-fetch`, configured in `.mcp.json`). It lets Claude pull in web pages, such as Express or Node documentation, so answers about this API can rest on the current docs instead of memory. The rule `mcp__fetch__fetch` under `permissions.allow` in `.claude/settings.json` lets Claude call that one read-only tool without a prompt each time. It allows nothing else: the server's other tools and any MCP resource tools still ask first.

## Skill
The `docline` skill captures a habit: every new function gets a one-line JSDoc comment above it. Its description says what it does and when to use it ("Use whenever you write or add a function, handler, or helper in this codebase, or when asked to document new functions"). That wording ties it to the moment of writing a function, so it fires without being named. The skill also states what to skip, such as inline callbacks and existing functions, so it doesn't over-trigger.

## Command
I added `/summarize-changes` (`.claude/commands/summarize-changes.md`). It gathers the working-tree status, the uncommitted diff, the branch's commits and the diff against `main` (or a base branch passed as an argument), then writes a short summary with an overview, changes by area, uncommitted work and risks. It's worth a shortcut because I would otherwise retype the same four git commands and the same output structure before every commit or PR. It can only run `git status`, `git diff` and `git log`, so it can't change anything.

## Hook
The hook runs on the `PostToolUse` event, matched to `Edit|Write`, so it reacts after a file has been changed. It can't prevent anything. `.claude/hooks/boo.js` finds the functions touched by the edit and appends `BOOO!` to their one-line doc comments. It's idempotent, so repeated edits don't stack the tag.

## Headless
I run a commanf to add a docline to all functions. It required adding write access.

