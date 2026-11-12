#!/usr/bin/env node
// PostToolUse hook: appends " BOOO!" to the one-line doc comment of every function touched by an Edit/Write.
const fs = require('fs');
const { execFileSync } = require('child_process');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const file = input.tool_input && input.tool_input.file_path;
if (!file || !/\.(js|mjs|cjs)$/.test(file) || !fs.existsSync(file)) process.exit(0);

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Collect changed line numbers (1-based) from git; untracked files count as fully changed.
const changed = new Set();
let tracked = true;
try { git('ls-files', '--error-unmatch', file); } catch { tracked = false; }
if (!tracked) {
  lines.forEach((_, i) => changed.add(i + 1));
} else {
  const diff = git('diff', '-U0', 'HEAD', '--', file);
  for (const m of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = +m[1], count = m[2] === undefined ? 1 : +m[2];
    for (let n = start; n < start + count; n++) changed.add(n);
  }
}

const FN = /^\s*(export\s+)?(async\s+)?function\b|^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?(\([^)]*\)|\w+)\s*=>/;
const DOC = /^(\s*)\/\*\*\s(.*?)\s*\*\/\s*$/;

// Map each changed line to its nearest preceding function start.
const touched = new Set();
for (const n of changed) {
  const line = lines[n - 1];
  if (line === undefined || line.trim() === '') continue; // blank lines belong to no function
  if (DOC.test(line)) { // a doc comment belongs to the function right below it
    if (FN.test(lines[n] || '')) touched.add(n);
    continue;
  }
  for (let i = n - 1; i >= 0; i--) {
    if (FN.test(lines[i])) { touched.add(i); break; }
  }
}

let modified = false;
for (const i of touched) {
  const m = i > 0 && lines[i - 1].match(DOC);
  if (m && !m[2].includes('BOOO!')) {
    lines[i - 1] = `${m[1]}/** ${m[2]} BOOO! */`;
    modified = true;
  }
}
if (modified) fs.writeFileSync(file, lines.join('\n'));
