#!/usr/bin/env node
// PostToolUse hook (Edit|Write): checks the edited file against the project standards in CLAUDE.md.
// Exit 0 when clean; exit 2 with the problems on stderr so Claude sees them and fixes them.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const file = input.tool_input && input.tool_input.file_path;
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
if (!file || !/\.js$/.test(file) || !fs.existsSync(file)) process.exit(0);

const rel = path.relative(root, file).split(path.sep).join('/');
if (rel.startsWith('..') || rel.startsWith('node_modules/') || !/^(server\.js|routes\/|db\/|tests\/)/.test(rel)) process.exit(0);

const problems = [];

// 1. ESLint, using the project config (same scope as `npm run lint`).
const eslint = path.join(root, 'node_modules', '.bin', 'eslint');
if (fs.existsSync(eslint)) {
  const r = spawnSync(eslint, [rel], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) problems.push(`ESLint:\n${(r.stdout + r.stderr).trim()}`);
}

// 2. Conventions from CLAUDE.md, checked on route files.
if (rel.startsWith('routes/')) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    // Error responses must be JSON shaped { "error": "message" }.
    if (/\.status\(\s*[45]\d\d\s*\)/.test(line) && !/\.json\(\s*\{\s*error\s*:/.test(line)) {
      problems.push(`${at}: error responses must use .json({ error: 'message' })`);
    }
    // Routes must not hold state; data lives in db/store.js.
    if (/^(let|var)\s/.test(line) || /^const\s+\w+\s*=\s*(\[|new (Map|Set)\b|\{\s*\})/.test(line)) {
      problems.push(`${at}: routes must not hold state; use db/store.js`);
    }
  });
}

if (problems.length) {
  process.stderr.write(`Project standards check failed for ${rel}:\n${problems.join('\n')}\n`);
  process.exit(2);
}
