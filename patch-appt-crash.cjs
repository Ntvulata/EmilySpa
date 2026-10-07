const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  'if (c) c.activePackages.forEach(p => pkgIds.add(p.packageId));',
  'if (c && c.activePackages) c.activePackages.forEach(p => pkgIds.add(p.packageId));'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched appointments activePackages bug.");
