const fs = require('fs');
const h = fs.readFileSync('C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html', 'utf8');
const spots = [71926, 86287, 98189, 100420];
spots.forEach(i => {
  console.log('==== @' + i + ' ====' );
  console.log(h.substring(Math.max(0, i - 140), i + 180));
  console.log('');
});
