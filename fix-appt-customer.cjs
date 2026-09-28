const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(/savedAppt\.customer,/g, 'savedAppt.customerId,');
code = code.replace(/updatedAppt\.customer,/g, 'updatedAppt.customerId,');
code = code.replace(/processPackageDeduction = \(apptId: string, customer: string,/g, 'processPackageDeduction = (apptId: string, customerId: string,');
code = code.replace(/customerId: customer,/g, 'customerId,');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
