/* Dump header/brand/logo blocks from the frontend gate file. */
const fs = require('fs');
const F = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const lines = fs.readFileSync(F, 'utf8').split(/\r?\n/);

const needles = [
  '"hub"', 'hub</span>', 'images/', 'logo', 'brand', 'w-14 h-14', 'w-12 h-12', 'KH',
];

console.log('===== LOGO / BRAND / ICON OCCURRENCES =====');
lines.forEach((ln, i) => {
  for (const n of needles) {
    if (ln.includes(n)) {
      console.log('L' + (i + 1) + '  [' + n + ']  ' + ln.trim().slice(0, 260));
      break;
    }
  }
});

console.log('\n===== HEADER BLOCK 124-136 =====');
for (let i = 123; i < 136; i++) console.log('L' + (i + 1) + ' | ' + (lines[i] === undefined ? '' : lines[i].slice(0, 400)));
