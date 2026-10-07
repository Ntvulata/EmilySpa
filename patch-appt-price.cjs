const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /\(item\.price \|\| "0"\)\.toString\(\)/g;
code = code.replace(regex, 'formatVnd(item.price || 0)');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched price format in CSV.");
