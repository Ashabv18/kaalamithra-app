const fs = require('fs');
const roots = [
  'C:/Users/Lenovo/Downloads/kaalamithra-complete',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)',
  'C:/Users/Lenovo/Downloads/kaalamithra-app',
  'C:/Users/Lenovo/Downloads/kaalamithra-src',
  'C:/Users/Lenovo/Downloads/kaalamithra-jul2026-main (3)',
  'C:/Users/Lenovo/Downloads/kaalamithra-push',
];
roots.forEach(r => {
  try {
    const top = fs.readdirSync(r);
    const appDir = top.find(d => d.toLowerCase() === 'app');
    const appPath = appDir ? r + '/' + appDir : null;
    console.log(r.split('/').pop() + ':');
    console.log('  top:', top.slice(0, 14).join(', ') + (top.length > 14 ? ', ...' : ''));
    console.log('  appDir:', appDir);
    if (appPath) {
      const files = fs.readdirSync(appPath);
      console.log('  app/ files:', files.slice(0, 20).join(', ') + (files.length > 20 ? ', ...' : ''));
      if (files.includes('index.html')) {
        const h = fs.readFileSync(appPath + '/index.html', 'utf8');
        const s = h.match(/KAALA MITHRA/g);
        console.log('  index.html: spaced KAALA MITHRA =', s ? s.length : 0,
          '| has logo.png img =', h.includes('images/logo.png'));
        // also check for the QR image reference and the hub icon in auth gate
        console.log('  has qr img ref =', h.includes('qr-916361842299.png'),
          '| auth-gate hub icon =', h.includes('material-symbols-outlined text-white text-[30px]")>hub'),
          '| brand p =', h.includes('>KAALA MITHRA<') ? 'SPACED' : (h.includes('>KAALAMITHRA<') ? 'UNSPACED' : 'UNKNOWN'));
      } else {
        console.log('  index.html: MISSING');
      }
    } else {
      console.log('  no app/ dir');
    }
    console.log('');
  } catch (e) {
    console.log(r.split('/').pop() + ': ERROR ' + e.message);
    console.log('');
  }
});
