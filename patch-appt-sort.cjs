const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  '}).sort((a, b) => a.time.localeCompare(b.time));',
  '}).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched appointment sort order.");
