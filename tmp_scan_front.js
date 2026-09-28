const fs = require('fs');
const path = require('path');

const roots = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)',
];

function walk(dir, depth, out) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push({ kind: 'DIR', path: p, size: 0 });
      if (depth < 3 && e.name !== 'node_modules' && e.name !== '.git') walk(p, depth + 1, out);
    } else {
      let sz = 0;
      try { sz = fs.statSync(p).size; } catch (_) {}
      out.push({ kind: 'FILE', path: p, size: sz });
    }
  }
}

for (const r of roots) {
  const out = [];
  walk(r, 0, out);
  const htmls = out.filter(l => l.kind === 'FILE' && /\.html?$/i.test(l.path));
  console.log('=== ' + r + ' ===');
  if (!fs.existsSync(r)) { console.log('  (missing)'); continue; }
  console.log('  tree: ' + out.length + ' entries');
  console.log('  html files: ' + htmls.length);
  htmls.forEach(h => console.log('   ' + h.path + '  (' + h.size + ' bytes)'));
  const imgs = out.filter(l => l.kind === 'FILE' && /\.(png|jpg|jpeg|svg|webp|ico)$/i.test(l.path));
  console.log('  image files: ' + imgs.length);
  imgs.slice(0, 60).forEach(i => console.log('   ' + i.path + '  (' + i.size + ' bytes)'));
  console.log('');
}
