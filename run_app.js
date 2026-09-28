const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
function start(name, args, log) {
  const out = fs.openSync(path.join(__dirname, log + '.log'), 'a');
  const err = fs.openSync(path.join(__dirname, log + '.err.log'), 'a');
  const p = spawn(process.execPath, args, { cwd: __dirname, detached: true, stdio: ['ignore', out, err] });
  p.unref();
  console.log(name + ' pid=' + p.pid);
}
start('backend', ['server.js'], 'run-backend');
start('frontend', ['run_frontend_server.js'], 'run-frontend');
setTimeout(() => process.exit(0), 1000);
