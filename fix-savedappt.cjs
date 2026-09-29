const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Fix editId branch
code = code.replace(
  /\.\.\.form,\s*price: p,/g,
  `...form,\n          endTime: finalEndTime,\n          price: p,`
);

// Fix new branch
code = code.replace(
  /endTime: form\.endTime,\s*customerId: form\.customerId,/g,
  `endTime: finalEndTime,\n        customerId: form.customerId,`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed finalEndTime in savedAppt");
