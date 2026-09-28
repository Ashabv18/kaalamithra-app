const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const html = fs.readFileSync(path, 'utf8');

// Find all img tags and material-symbols hub occurrences with context
const imgRe = /<img[^>]*>/g;
let m;
console.log('=== ALL <IMG> TAGS ===');
while ((m = imgRe.exec(html)) !== null) {
  console.log('AT', m.index, ':', m[0].substring(0, 200));
}

console.log('\n=== ALL "hub" MATERIAL SYMBOLS ===');
const hubRe = /material-symbols-outlined[^>]*>hub</g;
while ((m = hubRe.exec(html)) !== null) {
  console.log('AT', m.index, ':', m[0]);
  console.log('CONTEXT:', html.substring(Math.max(0, m.index - 60), m.index + m[0].length + 40));
}
