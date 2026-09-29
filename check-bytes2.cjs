const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');
const filterMatch = code.match(/\.filter\(\(t: any\) => !t\.role \|\| t\.role === (.*?)\)/);
if (filterMatch) console.log(filterMatch[1]);
else console.log("Not found");
