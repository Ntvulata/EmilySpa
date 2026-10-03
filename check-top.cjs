const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regexOldPkgTop = /\{customerPackages\.length > 0 && \(\s*<div className="col-span-1 space-y-1\.5 p-2\.5/;
const match = code.match(regexOldPkgTop);
console.log(match ? "Found top block" : "Top block not found");
