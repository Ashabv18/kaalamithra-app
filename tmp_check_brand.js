const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const html = fs.readFileSync(path, 'utf8');

// find the brand text line
const idx = html.indexOf('KAALA');
if (idx === -1) { console.log('NO KAALA FOUND'); process.exit(1); }
console.log('CONTEXT:', JSON.stringify(html.substring(idx - 20, idx + 30)));
