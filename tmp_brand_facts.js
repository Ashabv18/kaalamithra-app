// Identify which downloaded PNG is the KL lockup (wide) vs the square hub icon,
// and dump the exact brand block from every frontend copy.
const fs = require('fs');
const crypto = require('crypto');

function pngSize(p) {
  try {
    const b = fs.readFileSync(p);
    if (b.slice(1, 4).toString() !== 'PNG') return 'not-png';
    return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20) + ' bytes=' + b.length;
  } catch (e) { return 'ERR ' + e.message; }
}

const imgs = [
  'C:/Users/Lenovo/Downloads/kaalamithra-logo.png',
  'C:/Users/Lenovo/Downloads/image-1.png',
  'C:/Users/Lenovo/Downloads/image-2.png',
];
console.log('=== CANDIDATE PNGs (w x h) ===');
for (const p of imgs) console.log(p + '  ->  ' + pngSize(p));

const gates = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html',
];
console.log('\n=== GATE COPIES ===');
for (const g of gates) {
  if (!fs.existsSync(g)) { console.log('\n[MISSING] ' + g); continue; }
  const src = fs.readFileSync(g, 'utf8');
  console.log('\n[OK] ' + g);
  console.log('  bytes=' + Buffer.byteLength(src) + ' sha1=' + crypto.createHash('sha1').update(src).digest('hex').slice(0, 12));
  console.log('  has "KAALA MITHRA"  : ' + /KAALA\s+MITHRA/.test(src));
  console.log('  has "KAALAMITHRA"   : ' + /KAALAMITHRA/.test(src));
  console.log('  has material icon   : ' + /material-symbols/i.test(src));
  console.log('  img tags            : ' + (src.match(/<img[^>]*>/g) || []).join(' | '));
  const i = src.indexOf('<body');
  const lines = src.split(/\r?\n/);
  console.log('  ---- body head (first 45 lines from <body>) ----');
  const start = lines.findIndex((l) => l.includes('<body'));
  console.log(lines.slice(start, start + 45).map((l, n) => (start + n + 1) + ': ' + l).join('\n'));
}
