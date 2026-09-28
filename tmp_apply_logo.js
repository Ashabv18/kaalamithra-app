const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1) Copy image-2.png -> app/images/logo.png
const src = 'C:/Users/Lenovo/Downloads/image-2.png';
const dst = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/images/logo.png';
const dir = require('path').dirname(dst);
try { require('fs').mkdirSync(dir, { recursive: true }); } catch (e) {}
require('fs').copyFileSync(src, dst);
const info = require('fs').statSync(dst);
console.log('COPIED logo.png', info.size, 'bytes');

// 2) Replace the hub icon box with an <img> logo
html = html.replace(
  /<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-container via-secondary to-tertiary shadow-lg flex items-center justify-center">\s*<span class="material-symbols-outlined text-white text-\[30px\]">hub<\/span>\s*<\/div>/,
  '<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-container via-secondary to-tertiary shadow-lg flex items-center justify-center overflow-hidden">\n          <img alt="KAALAMITHRA logo" class="w-full h-full object-cover" src="images/logo.png" />\n        </div>'
);

// 3) Remove the space in the brand text
html = html.replace(/>KAALA MITHRA</g, '>KAALAMITHRA<');

if (html === fs.readFileSync(path, 'utf8')) {
  console.log('NO CHANGE MADE (pattern not matched)'); process.exit(1);
}
fs.writeFileSync(path, html, 'utf8');
console.log('PATCHED index.html');
console.log('--- brand text check ---');
console.log(html.includes('KAALA MITHRA') ? 'STILL HAS SPACE' : 'SPACE REMOVED OK');
console.log(html.includes('<img alt="KAALAMITHRA logo"') ? 'LOGO IMG PRESENT' : 'LOGO IMG MISSING');
