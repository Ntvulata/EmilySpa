const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(/customer,/g, 'customerId,');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Replaced all customer, with customerId,");
