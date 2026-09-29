const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// In the grid mapping: rows.filter(...)
// I will change it so that if r.therapistId and r.therapist are both empty, it defaults to the first therapist!
code = code.replace(
  /rows\.filter\(r => \(r\.therapistId && \(r\.therapistId === therapist\.id \|\| r\.therapistId === therapist\.name\)\) \|\| r\.therapist === therapist\.name\)/g,
  'rows.filter(r => { const tId = r.therapistId || r.therapist || masterTherapists[0].name; return tId === therapist.id || tId === therapist.name; })'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed grid fallback filter");
