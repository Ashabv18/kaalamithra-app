const fs = require('fs');

const files = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\kaalamithra-complete\\app\\index.html',
];

const pats = [/KAALA/i, /MITHRA/i, /logo/i, /<img/i, /favicon/i, /images\//i, /icon/i];

for (const f of files) {
  console.log('=== ' + f + ' ===');
  if (!fs.existsSync(f)) { console.log('  (missing)'); continue; }
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  console.log('  lines: ' + lines.length);
  lines.forEach((l, i) => {
    if (pats.some(p => p.test(l))) {
      console.log('  ' + String(i + 1).padStart(6) + ': ' + l.trim().slice(0, 220));
    }
  });
  console.log('');
}
