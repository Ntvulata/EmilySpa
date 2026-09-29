const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\],\n\s*type: "deduct",\n\s*customer,\n\s*packageId,/g,
  `date: new Date().toISOString().split("T")[0],\n        type: "deduct",\n        customerId,\n        packageId,`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed processPackageDeduction customer to customerId");
