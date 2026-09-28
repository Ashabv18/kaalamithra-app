const fs = require('fs'), p = require('path'), crypto = require('crypto');

function pngSize(f) {
  const b = fs.readFileSync(f);
  if (b.slice(1, 4).toString() !== 'PNG') return 'not-png';
  return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20) + ' bytes=' + b.length;
}

const dl = 'C:/Users/Lenovo/Downloads';
console.log('=== DOWNLOADS PNG META ===');
for (const f of ['image-1.png', 'image-2.png', 'kaalamithra-logo.png']) {
  const full = p.join(dl, f);
  console.log(f, fs.existsSync(full) ? pngSize(full) : 'MISSING', fs.existsSync(full) ? fs.statSync(full).mtime.toISOString() : '');
}

const repoApp = p.join(dl, 'kaalamithra-push', 'repo', 'app');
console.log('\n=== REPO app/images ===');
const imgDir = p.join(repoApp, 'images');
if (fs.existsSync(imgDir)) {
  for (const f of fs.readdirSync(imgDir)) {
    console.log(' ', f, fs.statSync(p.join(imgDir, f)).size);
  }
} else console.log('  (no images dir)');

console.log('\n=== index.html references to images/ ===');
const gate = fs.readFileSync(p.join(repoApp, 'index.html'), 'utf8');
const lines = gate.split(/\r?\n/);
lines.forEach((l, i) => {
  if (/images\/|\.png|\.jpg|\.svg|alt="[^"]*[Ll]ogo/.test(l)) {
    const m = l.match(/(?:src|href)="([^"]*)"/g);
    console.log(' L' + (i + 1), (m ? m.join(' ') : '(alt only)'), 'len=' + l.length);
  }
});

console.log('\n=== GATE BRAND BLOCK RAW (L18-28) ===');
console.log(lines.slice(17, 28).map((l, i) => (i + 18) + '| ' + l).join('\n'));

console.log('\n=== COPIES OF index.html (size + sha1) ===');
const copies = [
  p.join(dl, 'kaalamithra-push', 'repo', 'app', 'index.html'),
  p.join(dl, 'kaalamithra-complete', 'app', 'index.html'),
  p.join(dl, 'kaalamithra-complete (1)', 'kaalamithra-complete', 'app', 'index.html'),
];
for (const c of copies) {
  if (!fs.existsSync(c)) { console.log('MISSING', c); continue; }
  const b = fs.readFileSync(c);
  console.log(b.length, crypto.createHash('sha1').update(b).digest('hex').slice(0, 12), c);
}

console.log('\n=== vercel config in repo ===');
for (const f of ['vercel.json', 'README.md', '.vercel/project.json', 'package.json']) {
  const full = p.join(dl, 'kaalamithra-push', 'repo', f);
  if (fs.existsSync(full)) {
    const txt = fs.readFileSync(full, 'utf8');
    console.log('---', f, '---');
    console.log(txt.length > 1500 ? txt.slice(0, 1500) + '\n...[truncated]' : txt);
  }
}

console.log('\n=== git status of repo ===');
const { execSync } = require('child_process');
try {
  console.log(execSync('git -C ' + JSON.stringify(p.join(dl, 'kaalamithra-push', 'repo')) + ' status --porcelain', { encoding: 'utf8' }) || '(clean)');
  console.log(execSync('git -C ' + JSON.stringify(p.join(dl, 'kaalamithra-push', 'repo')) + ' log --oneline -3', { encoding: 'utf8' }));
} catch (e) { console.log('git err', e.message); }
