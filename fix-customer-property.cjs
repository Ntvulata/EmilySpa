const fs = require('fs');

// Fix spa-data.ts
let dataCode = fs.readFileSync('src/lib/spa-data.ts', 'utf8');
dataCode = dataCode.replace(/customer: string;/, 'customerId: string;');
fs.writeFileSync('src/lib/spa-data.ts', dataCode, 'utf8');

// Fix appointments
let apptCode = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');
apptCode = apptCode.replace(/\.filter\(h => h\.customer === form\.customerId\)/g, '.filter(h => h.customerId === form.customerId)');
fs.writeFileSync('src/routes/dashboard.appointments.tsx', apptCode, 'utf8');

console.log("Fixed!");
