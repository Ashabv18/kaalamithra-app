/* One-shot recon: frontend copies, brand text occurrences, image assets. */
const fs = require('fs');
const path = require('path');

const copies = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/app/index.html',
];

const imgDirs = [
  'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/images',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete/app/images',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/images',
];

const dl = [
  'C:/Users/Lenovo/Downloads/image-1.png',
  'C:/Users/Lenovo/Downloads/image-2.png',
  'C:/Users/Lenovo/Downloads/kaalamithra-logo.png',
];

function size(p) {
  try { return fs.statSync(p).size; } catch (e) { return null; }
}
function pngDim(p) {
  try {
    const b = fs.readFileSync(p);
    return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
  } catch (e) { return 'MISSING'; }
}

console.log('===== FRONTEND COPIES =====');
const live = [];
for (const c of copies) {
  const s = size(c);
  console.log((s === null ? 'MISSING  ' : String(s).padStart(9) + '  ') + c);
  if (s !== null) live.push(c);
}

console.log('\n===== BRAND TEXT OCCURRENCES ("KAALA" brand name, any case/spacing) =====');
const nameRe = /KAALA\s*MITHRA|Kaala\s*Mithra|kaala\s*mithra/gi;
for (const c of live) {
  const lines = fs.readFileSync(c, 'utf8').split(/\r?\n/);
  console.log('\n--- ' + c + ' (' + lines.length + ' lines) ---');
  lines.forEach((ln, i) => {
    nameRe.lastIndex = 0;
    if (nameRe.test(ln)) {
      const m = ln.match(nameRe);
      console.log('  L' + (i + 1) + ' x' + m.length + '  ' + ln.trim().slice(0, 200));
    }
  });
}

console.log('\n===== IMAGE DIRS =====');
for (const d of imgDirs) {
  console.log('\n--- ' + d + ' ---');
  try {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.statSync(p);
      console.log('  ' + String(st.size).padStart(8) + '  ' + f + (f.toLowerCase().endsWith('.png') ? '  ' + pngDim(p) : ''));
    }
  } catch (e) { console.log('  MISSING DIR'); }
}

console.log('\n===== FILES IN repo/app (non-recursive) =====');
try {
  for (const f of fs.readdirSync('C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app')) {
    const st = fs.statSync('C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/' + f);
    console.log('  ' + (st.isDirectory() ? 'DIR ' : String(st.size).padStart(9)) + '  ' + f);
  }
} catch (e) { console.log('  MISSING'); }

console.log('\n===== DOWNLOADED PNGs =====');
for (const f of dl) console.log('  ' + String(size(f)).padStart(9) + '  ' + pngDim(f) + '  ' + f);
