const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  'type: "deduct",\n        customer,\n        packageId,',
  'type: "deduct",\n        customerId,\n        packageId,'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed customerId");
