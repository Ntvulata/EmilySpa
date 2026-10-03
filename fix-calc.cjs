const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /const parsed = parseInt\(s\.duration\.replace\(\/\\D\/g, ""\)\);/,
  `const parsed = typeof s.duration === 'string' ? parseInt(s.duration.replace(/\\D/g, "")) : parseInt(String(s.duration || 0).replace(/\\D/g, ""));`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated calculateEndTime");
