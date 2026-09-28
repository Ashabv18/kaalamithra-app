/* tmp_brand_block.js - dump brand/logo markup region from the frontend copies */
const fs = require('fs');
const p = require('path');

const files = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/index.html',
];

for (const f of files) {
  console.log('\n================ ' + f + ' ================');
  if (!fs.existsSync(f)) { console.log('  MISSING'); continue; }
  const src = fs.readFileSync(f, 'utf8');
  console.log('  size=' + src.length + '  lines=' + src.split(/\r?\n/).length);

  // images folder sibling
  const dir = p.dirname(f);
  const imgDir = p.join(dir, 'images');
  if (fs.existsSync(imgDir)) {
    console.log('  images/: ' + fs.readdirSync(imgDir).join(', '));
  } else {
    console.log('  images/: (none)');
  }

  const lines = src.split(/\r?\n/);
  const idx = [];
  lines.forEach((l, i) => {
    if (/KAALA|MITHRA|Kaala\s*Mithra|gate-logo|brand|logo/i.test(l)) idx.push(i);
  });
  console.log('  hit lines: ' + idx.map(i => i + 1).join(', '));

  // print unique regions of +-3 lines
  const printed = new Set();
  for (const i of idx) {
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
      if (printed.has(j)) continue;
      printed.add(j);
      console.log('  ' + String(j + 1).padStart(5) + '| ' + lines[j].slice(0, 400));
    }
    console.log('  ' + '-'.repeat(60));
  }
}
