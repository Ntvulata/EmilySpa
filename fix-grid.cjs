const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /rows\.filter\(r => r\.therapistId === therapist\.id \|\| r\.therapist === therapist\.name\)/g,
  'rows.filter(r => (r.therapistId && (r.therapistId === therapist.id || r.therapistId === therapist.name)) || r.therapist === therapist.name)'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed grid therapist filter");
