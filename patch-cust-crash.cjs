const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

// Fix getActivePackages signature and usage to default to []
code = code.replace(
  'const getActivePackages = (customerId: string, legacyPackages: CustomerPackage[]) => {',
  'const getActivePackages = (customerId: string, legacyPackages: CustomerPackage[] = []) => {'
);

code = code.replace(
  'const formActivePackages = getActivePackages(form.id || "", activePackages);',
  'const formActivePackages = getActivePackages(form.id || "", activePackages || []);'
);

code = code.replace(
  'const validPackages = getActivePackages(item.id, item.activePackages);',
  'const validPackages = getActivePackages(item.id, item.activePackages || []);'
);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Patched undefined activePackages bug.");
