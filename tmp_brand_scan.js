const fs = require('fs');
const path = require('path');

const DL = 'C:\\Users\\Lenovo\\Downloads';

// 1) find kaala* folders in Downloads
const dirs = fs.readdirSync(DL, { withFileTypes: true })
  .filter(d => d.isDirectory() && /kaala/i.test(d.name))
  .map(d => path.join(DL, d.name));
console.log('=== kaala* folders in Downloads ===');
dirs.forEach(d => console.log('  ' + d));

// 2) find every app/index.html (and root index.html) under them
const found = [];
function walk(dir, depth) {
  if (depth > 4) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/node_modules|\.git$/.test(e.name)) continue;
      walk(p, depth + 1);
    } else if (/index\.html$/i.test(e.name)) {
      found.push(p);
    }
  }
}
dirs.forEach(d => walk(d, 0));
console.log('=== index.html files ===');
found.forEach(p => {
  const txt = fs.readFileSync(p, 'utf8');
  console.log('  ' + p + '  bytes=' + Buffer.byteLength(txt) + '  hasGate=' + /GATE_API|km-entry/.test(txt));
});
