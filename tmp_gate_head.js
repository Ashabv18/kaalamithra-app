const fs = require('fs');

const files = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\app\\index.html',
];

for (const f of files) {
  console.log('=== ' + f + ' ===');
  let txt;
  try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('  MISSING: ' + e.message); continue; }
  const lines = txt.split(/\r?\n/);
  console.log('  lines: ' + lines.length + '  bytes: ' + Buffer.byteLength(txt));
  lines.slice(0, 40).forEach((l, i) => {
    console.log(String(i + 1).padStart(4) + ': ' + l);
  });
  console.log('--- logo/svg/img references ---');
  lines.forEach((l, i) => {
    if (/<img|\.png|\.svg|logo|<svg/i.test(l)) {
      const m = l.match(/.{0,90}(<img|\.png|\.svg|logo|<svg).{0,130}/i);
      console.log(String(i + 1).padStart(4) + ': ' + (m ? m[0] : l.slice(0, 200)));
    }
  });
  console.log('');
}

console.log('=== candidate image files ===');
const imgs = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-logo.png',
  'C:\\Users\\Lenovo\\Downloads\\image-1.png',
  'C:\\Users\\Lenovo\\Downloads\\image-2.png',
];
for (const p of imgs) {
  try {
    const b = fs.readFileSync(p);
    // PNG IHDR: width/height at bytes 16..24
    const isPng = b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    let dims = 'n/a';
    if (isPng) dims = b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
    console.log(p + '  bytes=' + b.length + '  png=' + isPng + '  dims=' + dims);
  } catch (e) {
    console.log(p + '  ERROR ' + e.message);
  }
}
