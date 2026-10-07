const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

code = code.replace(
  'setActivePackages([...c.activePackages]);',
  'setActivePackages(c.activePackages ? [...c.activePackages] : []);'
);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Patched startEdit activePackages bug.");
