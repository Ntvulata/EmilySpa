const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.index.tsx', 'utf8');

const replacement = `  const todayDateStr = new Date().toISOString().split("T")[0];
  const activeAppts = appointments.filter(a => a.status !== 'huy' && a.date === todayDateStr);
  const todaysAppts = appointments.filter(a => a.date === todayDateStr).sort((a, b) => a.time.localeCompare(b.time));`;

code = code.replace(
  'const activeAppts = appointments.filter(a => a.status !== \'huy\');',
  replacement
);

code = code.replace(
  'appointments.slice(0, 5).map((item)',
  'todaysAppts.slice(0, 5).map((item)'
);

fs.writeFileSync('src/routes/dashboard.index.tsx', code, 'utf8');
console.log("Patched dashboard today filter.");
