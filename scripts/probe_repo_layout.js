// What does the deployed bundle actually contain? Inspect tracked paths +
// confirm which of /, /app, /call.html are Express routes vs Vercel static files.
const { execSync } = require('child_process');
const files = execSync('git ls-files', { encoding: 'utf8', maxBuffer: 20e6 }).split(/\r?\n/).filter(Boolean);
const top = {};
for (const f of files) {
  const parts = f.split('/');
  const key = parts.length === 1 ? '(root) ' + parts[0] : parts[0] + '/';
  top[key] = (top[key] || 0) + 1;
}
console.log('--- top-level tracked entries ---');
Object.keys(top).sort().forEach((k) => console.log('  ' + top[k] + '  ' + k));
console.log('root index.html tracked: ' + files.some((f) => f === 'index.html'));
console.log('api/ files: ' + files.filter((f) => f.startsWith('api/')).join(', '));
console.log('api/index.js contents:');
try { console.log(require('fs').readFileSync('api/index.js', 'utf8')); } catch (e) { console.log('  MISSING ' + e.message); }
