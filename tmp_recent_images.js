const fs = require('fs');
const path = require('path');

const dirs = [
  'C:\\Users\\Lenovo\\Downloads',
  'C:\\Users\\Lenovo\\Pictures',
  'C:\\Users\\Lenovo\\Pictures\\Screenshots',
  'C:\\Users\\Lenovo\\Desktop',
];

const results = [];
for (const d of dirs) {
  let ents;
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
  for (const e of ents) {
    if (!e.isFile()) continue;
    if (!/\.(png|jpe?g|webp|avif|gif|bmp)$/i.test(e.name)) continue;
    const p = path.join(d, e.name);
    let st;
    try { st = fs.statSync(p); } catch (_) { continue; }
    results.push({ p, size: st.size, m: st.mtime });
  }
}

results.sort((a, b) => b.m - a.m);
console.log('total image files: ' + results.length);
console.log('--- 40 most recent ---');
results.slice(0, 40).forEach(r => {
  console.log(r.m.toISOString() + '  ' + String(r.size).padStart(9) + '  ' + r.p);
});
