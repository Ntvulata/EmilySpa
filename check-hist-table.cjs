const fs = require('fs');
const lines = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('item.customName') || l.includes('pDef'));
console.log(lines.slice(idx - 5, idx + 25).join('\n'));
