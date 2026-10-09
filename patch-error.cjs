const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace('}, [hl, viewMode, appts]);', '}, [hl, viewMode]);');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed ReferenceError");
