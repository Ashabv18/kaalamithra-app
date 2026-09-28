// Read PNG dimensions + size for candidate logo files, and inventory every frontend copy.
const fs = require('fs'), path = require('path');

function pngInfo(p) {
  try {
    const b = fs.readFileSync(p);
    if (b.length < 24 || b.toString('ascii', 1, 4) !== 'PNG') return { p, err: 'not-png' };
    return { p, bytes: b.length, w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch (e) { return { p, err: e.message }; }
}

const cands = [
  'C:/Users/Lenovo/Downloads/image-1.png',
  'C:/Users/Lenovo/Downloads/image-2.png',
  'C:/Users/Lenovo/Downloads/kaalamithra-logo.png',
];
console.log('=== CANDIDATE LOGOS ===');
for (const c of cands) console.log(JSON.stringify(pngInfo(c)));

const roots = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/index.html',
];

console.log('\n=== FRONTEND COPIES ===');
for (const r of roots) {
  try {
    const t = fs.readFileSync(r, 'utf8');
    const lines = t.split(/\r?\n/);
    const hits = [];
    lines.forEach((l, i) => { if (/KAALA\s*MITHRA|Kaala\s*Mithra|km-logo|Kaalamithra Logo|images\//i.test(l)) hits.push(i + 1); });
    console.log(r);
    console.log('  size=' + t.length + ' lines=' + lines.length + ' hits=' + hits.join(','));
  } catch (e) { console.log(r + '  ERR ' + e.message); }
}
