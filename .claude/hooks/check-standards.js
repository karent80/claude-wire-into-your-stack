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
  let depth = 0; // brace depth: 0 means module level, deeper means inside a function or block
  let inBlockComment = false;
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    // Blank out comments and string contents so braces inside them don't affect the depth.
    let code = '';
    for (let j = 0; j < line.length; j++) {
      const two = line.slice(j, j + 2);
      if (inBlockComment) { if (two === '*/') { inBlockComment = false; j++; } continue; }
      if (two === '/*') { inBlockComment = true; j++; continue; }
      if (two === '//') break;
      const ch = line[j];
      if (ch === "'" || ch === '"' || ch === '`') {
        const end = line.indexOf(ch, j + 1);
        if (end === -1) break;
        code += '""';
        j = end;
        continue;
      }
      code += ch;
    }
    // Error responses must be JSON shaped { "error": "message" }.
    if (/\.status\(\s*[45]\d\d\s*\)/.test(code) && !/\.json\(\s*\{\s*error\s*:/.test(line)) {
      problems.push(`${at}: error responses must use .json({ error: 'message' })`);
    }
    // Routes must not hold persistent state; data lives in db/store.js.
    // Only module-level declarations count. Variables inside a handler are per-request and fine.
    if (depth === 0 && (/^(let|var)\s/.test(code) || /^const\s+\w+\s*=\s*(\[|new\s+(Map|Set|WeakMap|WeakSet)\b|\{)/.test(code))) {
      problems.push(`${at}: module-level state in a route file; keep data in db/store.js`);
    }
    for (const ch of code) {
      if (ch === '{') depth += 1;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
  });
}

if (problems.length) {
  process.stderr.write(`Project standards check failed for ${rel}:\n${problems.join('\n')}\n`);
  process.exit(2);
}
