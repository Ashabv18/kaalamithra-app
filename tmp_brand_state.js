// Recon: brand-text occurrences, header logo src, local frontend copies, image sizes
const fs = require('fs');
const path = require('path');

const files = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/README.md',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/index.html',
];

const re = /KAALA\s*MITHRA|Kaala\s*Mithra|KAALA&nbsp;MITHRA|hub<|images\/[A-Za-z0-9._-]+\.(png|jpg|svg|jpeg|webp)/gi;

for (const f of files) {
  let st = null;
  try { st = fs.statSync(f); } catch (e) { console.log('\n=== ' + f + ' === MISSING'); continue; }
  const txt = fs.readFileSync(f, 'utf8');
  const lines = txt.split(/\r?\n/);
  console.log('\n=== ' + f + ' === size=' + st.size + ' lines=' + lines.length + ' mtime=' + st.mtime.toISOString());
  lines.forEach((ln, i) => {
    if (re.test(ln)) {
      const hits = [...new Set(ln.match(re) || [])].join(' | ');
      console.log('  ' + (i + 1) + ': [' + hits + ']  ' + ln.trim().slice(0, 240));
    }
    re.lastIndex = 0;
  });
}

// local image dirs
for (const d of [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/images',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/images',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/images',
  'C:/Users/Lenovo/Downloads',
]) {
  console.log('\n--- DIR ' + d);
  try {
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      const s = fs.statSync(p);
      if (s.isFile() && /\.(png|jpg|jpeg|svg|webp)$/i.test(e)) {
        // PNG dims
        let dims = '';
        try {
          const b = fs.readFileSync(p);
          if (b.slice(1, 4).toString() === 'PNG') dims = ' ' + b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
        } catch (e2) {}
        console.log('   ' + e + '  ' + s.size + dims + '  ' + s.mtime.toISOString());
      }
    }
  } catch (e) { console.log('   (missing)'); }
}
