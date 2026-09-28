const fs = require('fs');

function pngSize(p) {
  const b = fs.readFileSync(p);
  if (b.slice(1, 4).toString() !== 'PNG') return 'not-png';
  return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20) + ' (' + b.length + ' bytes)';
}

const cands = [
  'C:/Users/Lenovo/Downloads/image-1.png',
  'C:/Users/Lenovo/Downloads/image-2.png',
  'C:/Users/Lenovo/Downloads/kaalamithra-logo.png',
];
for (const c of cands) {
  try { console.log(c + '  ->  ' + pngSize(c)); } catch (e) { console.log(c + '  ->  MISSING'); }
}

const gate = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const lines = fs.readFileSync(gate, 'utf8').split(/\r?\n/);
console.log('\n=== "KAALA MITHRA" hits in repo/app/index.html ===');
lines.forEach((l, i) => {
  if (/KAALA\s+MITHRA/i.test(l) || /Kaala\s+Mithra/i.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 220));
});

console.log('\n=== header brand markup (lines 125-128) ===');
for (let i = 124; i < 128 && i < lines.length; i++) console.log((i + 1) + ': ' + lines[i].slice(0, 420));

console.log('\n=== any <img ... logo ...> in repo/app/index.html ===');
lines.forEach((l, i) => { if (/<img[^>]*logo/i.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 300)); });
