const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(
  'if (!name || !value || !price) {',
  'if (!name || value === undefined || isNaN(value) || value <= 0 || price === undefined || isNaN(price)) {'
);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Patched zero-price package bug.");
