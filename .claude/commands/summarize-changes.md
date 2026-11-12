---
description: Summarize what changed on this branch and in the working tree
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
argument-hint: [base-branch]
---

Summarize what changed. Compare against `$ARGUMENTS` if given, otherwise against `main`.

## Context

- Working tree: !`git status --short`
- Uncommitted diff: !`git diff HEAD --stat`
- Commits on this branch: !`git log --oneline ${ARGUMENTS:-main}..HEAD`
- Branch diff: !`git diff ${ARGUMENTS:-main}...HEAD --stat`

## Output

Read the actual diffs where the stats aren't enough, then reply with:

1. **Overview**: one or two sentences on the purpose of the changes.
2. **Changes**: a short bullet list grouped by area (routes, db, tests, config), naming the files.
3. **Uncommitted**: anything not yet committed, or "none".
4. **Watch out for**: risks, missing tests, or loose ends. Omit if there are none.

Keep it brief. Don't modify any files.
