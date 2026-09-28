/* tmp_scan_all.js - locate frontend copies, index.html files, brand markup */
const fs = require('fs');
const p = require('path');

const roots = [
  'C:/Users/Lenovo/Downloads',
];

function walk(d, out, depth) {
  if (depth > 4) return;
  let es = [];
  try { es = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
  for (const e of es) {
    const f = p.join(d, e.name);
    if (e.isDirectory()) {
      if (/node_modules|\.git|AppData|Application Data/i.test(e.name)) continue;
      walk(f, out, depth + 1);
    } else if (/index\.html$/i.test(e.name)) {
      out.push(f);
    }
  }
}

const found = [];
for (const r of roots) walk(r, found, 0);
console.log('=== index.html files under Downloads ===');
console.log(found.map(f => f + '  (' + fs.statSync(f).size + ' bytes)').join('\n'));

console.log('\n=== candidate logo images ===');
for (const f of ['C:/Users/Lenovo/Downloads/kaalamithra-logo.png',
                 'C:/Users/Lenovo/Downloads/image-1.png',
                 'C:/Users/Lenovo/Downloads/image-2.png']) {
  if (fs.existsSync(f)) {
    const s = fs.statSync(f);
    console.log(f + '  ' + s.size + ' bytes  mtime=' + s.mtime.toISOString());
  } else {
    console.log(f + '  MISSING');
  }
}

console.log('\n=== brand markup hits ===');
const re = /KAALA|MITHRA|brand|logo|images\/|img\s+src/i;
for (const f of found) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((l, i) => { if (re.test(l)) hits.push('  ' + (i + 1) + ': ' + l.trim().slice(0, 200)); });
  if (hits.length) {
    console.log('\n--- ' + f + ' (' + hits.length + ' hits) ---');
    console.log(hits.slice(0, 60).join('\n'));
  }
}
