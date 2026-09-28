/* One-shot fact dump: brand text, <img> tags, asset inventory across all frontend copies. */
const fs = require('fs');
const p = require('path');
const crypto = require('crypto');

const COPIES = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete',
  "C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete",
];

const DLOADS = ['image-1.png', 'image-2.png', 'kaalamithra-logo.png'].map(f =>
  'C:/Users/Lenovo/Downloads/' + f
);

function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function md5(b) {
  return crypto.createHash('md5').update(b).digest('hex').slice(0, 8);
}

console.log('=== DOWNLOADED CANDIDATE IMAGES ===');
for (const f of DLOADS) {
  if (!fs.existsSync(f)) { console.log('MISSING ' + f); continue; }
  const b = fs.readFileSync(f);
  const s = pngSize(b);
  console.log(`${p.basename(f)}  bytes=${b.length}  md5=${md5(b)}  dims=${s ? s.w + 'x' + s.h : 'not-png'}`);
}

for (const root of COPIES) {
  console.log('\n=== ' + root + ' ===');
  if (!fs.existsSync(root)) { console.log('  (missing)'); continue; }
  const idx = p.join(root, 'app', 'index.html');
  if (!fs.existsSync(idx)) { console.log('  no app/index.html'); }
  else {
    const txt = fs.readFileSync(idx, 'utf8');
    const lines = txt.split(/\r?\n/);
    console.log(`  app/index.html bytes=${txt.length} md5=${md5(Buffer.from(txt))} lines=${lines.length}`);
    lines.forEach((ln, i) => {
      if (/KAAL/i.test(ln) || /<img/i.test(ln) || /logo/i.test(ln) || /\.png/i.test(ln)) {
        console.log(`  L${i + 1}: ${ln.trim()}`);
      }
    });
  }
  const imgDir = p.join(root, 'app', 'images');
  if (fs.existsSync(imgDir)) {
    const files = fs.readdirSync(imgDir);
    console.log('  images/: ' + files.map(f => {
      const b = fs.readFileSync(p.join(imgDir, f));
      return `${f}(${b.length}B)`;
    }).join(', '));
  } else { console.log('  no app/images/'); }
  const rootIdx = p.join(root, 'index.html');
  if (fs.existsSync(rootIdx)) {
    const t = fs.readFileSync(rootIdx, 'utf8');
    console.log(`  root index.html bytes=${t.length} ; has KAALA=${/KAAL/i.test(t)}`);
  }
}
