const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /c\.activePackages\.forEach\(p => pkgIds\.add\(p\.id\)\);/g,
  'c.activePackages.forEach(p => pkgIds.add(p.packageId));'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
