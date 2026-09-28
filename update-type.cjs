const fs = require('fs');
let code = fs.readFileSync('src/lib/spa-data.ts', 'utf8');

code = code.replace(
  /type: "sell" \| "deduct";/,
  'type: "sell" | "deduct" | "convert" | "refund";'
);

fs.writeFileSync('src/lib/spa-data.ts', code, 'utf8');
