const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

code = code.replace(
  /const rem = getRemainingPackageValue\(customerName, id\);/g,
  'const rem = getRemainingPackageValue(customerId, id);'
);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
