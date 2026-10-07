const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const regex = /a\.therapistId === t\.id/g;
code = code.replace(regex, "(a.therapistId === t.id || a.therapistId === t.name || (a as any).therapist === t.name)");

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched therapist filtering in reports");
