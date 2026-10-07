const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

code = code.replace(
  'const svcs = (a.serviceIds || []).map(id => {',
  'const svcs = (a.serviceIds || (a as any).services || []).map(id => {'
);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched exportToCsv services.");
