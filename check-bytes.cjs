const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');
const rolesMatch = code.match(/const roles = \[([^\]]+)\];/);
console.log(rolesMatch[1]);
