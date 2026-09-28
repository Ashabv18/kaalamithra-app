const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
let html = fs.readFileSync(path, 'utf8');

const before = html;

// 1) Remove the space in the 3 app-header brand chips: "KAALA MITHRA • AI TECH SOLUTION" -> "KAALAMITHRA • AI TECH SOLUTION"
html = html.replace(/KAALA MITHRA • AI TECH SOLUTION/g, 'KAALAMITHRA • AI TECH SOLUTION');

// 2) Replace the 3rd image (QR call-sheet) with the new logo
html = html.replace(
  /<img id="call-sheet-qr" src="images\/qr-916361842299\.png" alt="Scan to call" class="w-24 h-24 rounded-xl bg-white p-1 flex-shrink-0"\/>/,
  '<img id="call-sheet-qr" src="images/logo.png" alt="KAALAMITHRA logo" class="w-24 h-24 rounded-xl bg-white p-1 flex-shrink-0 shadow-sm"/>'
);

if (html === before) {
  console.log('NO CHANGE — patterns not matched'); process.exit(1);
}
fs.writeFileSync(path, html, 'utf8');

// verify
const spaced = html.match(/KAALA MITHRA/gu);
console.log('Remaining spaced "KAALA MITHRA":', spaced ? spaced.length : 0);
console.log('QR now points to logo.png:', html.includes('src="images/logo.png" alt="KAALAMITHRA logo"'));
console.log('Brand chips fixed:', html.includes('KAALAMITHRA • AI TECH SOLUTION') && !html.includes('KAALA MITHRA •'));
console.log('PATCHED OK');
