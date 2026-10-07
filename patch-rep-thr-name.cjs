const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const regex = /dbTherapists\.find\(t => t\.id === a\.therapistId\)\?\.name/g;
code = code.replace(regex, "dbTherapists.find(t => t.id === a.therapistId || t.name === a.therapistId)?.name");

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched therapistName in reports");
