const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const html = fs.readFileSync(path, 'utf8');

// find the brand <p> with the text — look for the specific class
const re = /<p class="font-label-code[^"]*"[^>]*>([^<]*)<\/p>/;
const m = html.match(re);
if (!m) { console.log('BRAND P NOT FOUND'); process.exit(1); }
console.log('FOUND BRAND TEXT NODE:', JSON.stringify(m[0]));
console.log('TEXT INSIDE:', JSON.stringify(m[1]));

// now check for any remaining "KAALA MITHRA" (spaced)
const spaced = html.match(/KAALA MITHRA/g);
console.log('SPACED OCCURRENCES:', spaced ? spaced.length : 0);
