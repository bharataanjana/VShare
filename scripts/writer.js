const fs = require('fs');
const path = require('path');
function write(p, content) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
  console.log('Wrote:', p);
}
module.exports = { write };
