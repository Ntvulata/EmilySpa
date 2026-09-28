const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(
  /const commission = form\.commission \? Number\(form\.commission\.replace\(\/\\D\/g, ""\)\) : 0;\r?\n\s*const commission = Number\(form\.commission\.replace\(\/\\D\/g, ""\)\);/g,
  'const commission = form.commission ? Number(form.commission.replace(/\\D/g, "")) : 0;'
);

// Also need to make sure update function handles commission formatting like price
code = code.replace(
  /if \(key === "price"\) \{/g,
  'if (key === "price" || key === "commission") {'
);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
