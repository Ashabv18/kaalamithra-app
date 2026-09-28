const fs=require('fs');
const p='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
const t=fs.readFileSync(p,'utf8');
function show(re,label){ console.log('=== '+label+' ==='); const idx=t.search(re); if(idx<0){console.log('NOT FOUND');return} console.log(t.slice(Math.max(0,idx-800),idx+3500)); console.log('\n');}
show(/function gateSubmitLogin|gate-login-msg|KM_API_BASE|API_BASE/,'login js 1');
show(/Gate\.msg|function.*msg|Cannot reach/,'msg fn');
