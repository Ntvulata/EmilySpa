const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(/dbTherapists\[0\]\.id \|\| dbTherapists\[0\]\.name/g, 'dbTherapists[0]?.id || dbTherapists[0]?.name || ""');
code = code.replace(/dbTherapists\[0\]\.name/g, 'dbTherapists[0]?.name || ""');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed dbTherapists crash");
