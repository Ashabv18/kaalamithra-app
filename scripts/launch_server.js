// Start the backend as a detached background process that survives the shell
// that launched it (start /b dies with the parent in non-interactive shells).
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = fs.openSync(path.join(root, 'server_run.log'), 'w');
const err = fs.openSync(path.join(root, 'server_err.log'), 'w');
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', out, err],
  windowsHide: true,
});
child.unref();
console.log('LAUNCHED pid=' + child.pid + ' log=' + path.join(root, 'server_run.log'));
