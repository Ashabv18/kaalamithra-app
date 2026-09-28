const fs = require('fs');
const path = require('path');
// Copies the full local logo frontend into backend/public-site for Vercel deployment.
// Source: Downloads/kaalamithra-complete (1)/kaalamithra-complete/app  (index.html + call.html + images/)
// Dest:   backend/public-site/  (tracked by git, served by Express + Vercel)
const SRC = 'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app';
const DST = path.join(__dirname, '..', 'public-site');
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.endsWith('.bak') || e.name.endsWith('.bak2')) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
// Fresh copy: remove old dest first (except .gitkeep)
if (fs.existsSync(DST)) fs.rmSync(DST, { recursive: true, force: true });
copyDir(SRC, DST);
console.log('COPIED to public-site:');
for (const f of ['index.html', 'call.html', 'images/km-logo.png', 'images/hero.jpg']) {
  const p = path.join(DST, f);
  console.log((fs.existsSync(p) ? 'OK  ' : 'MISS') + ' ' + f + (fs.existsSync(p) ? ' bytes=' + fs.statSync(p).size : ''));
}
