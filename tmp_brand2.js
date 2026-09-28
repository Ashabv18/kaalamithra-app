const fs = require('fs');
const path = require('path');

const roots = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)',
  'C:\\Users\\Lenovo\\backend',
];

function walk(dir, depth, out) {
  if (depth > 6) return;
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/node_modules|\.git$|\.vercel$/.test(e.name)) continue;
      walk(p, depth + 1, out);
    } else if (/\.(html|js)$/i.test(e.name)) {
      out.push(p);
    }
  }
}

const targets = [];
for (const r of roots) walk(r, 0, targets);

console.log('=== files containing "KAALA" + spacing variants ===');
for (const p of targets) {
  let txt;
  try { txt = fs.readFileSync(p, 'utf8'); } catch (e) { continue; }
  if (!/KAALA/i.test(txt)) continue;
  const lines = txt.split(/\r?\n/);
  const hits = [];
  lines.forEach((l, i) => {
    const re = /KAALA[\s_]*MITHRA/gi;
    let m;
    while ((m = re.exec(l)) !== null) {
      hits.push({ line: i + 1, token: m[0] });
    }
  });
  console.log('--- ' + p + '  (bytes=' + Buffer.byteLength(txt) + ')');
  hits.forEach(h => console.log('    line ' + h.line + ': [' + h.token + ']'));
}

console.log('');
console.log('=== images folders ===');
for (const r of roots) {
  const imgs = path.join(r, 'app', 'images');
  const pimgs = path.join(r, 'public', 'images');
  for (const d of [imgs, pimgs]) {
    if (!fs.existsSync(d)) continue;
    console.log('--- ' + d);
    fs.readdirSync(d).forEach(f =>
      console.log('    ' + f + '  ' + fs.statSync(path.join(d, f)).size + 'B')
    );
  }
}

console.log('');
console.log('=== index.html / logo assets present ===');
for (const r of roots) {
  ['index.html', 'app\\index.html', 'public\\index.html', 'public\\client\\index.html'].forEach(rel => {
    const p = path.join(r, rel);
    if (fs.existsSync(p)) console.log('    ' + p + '  ' + fs.statSync(p).size + 'B');
  });
}
