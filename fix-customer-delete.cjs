const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

// Remove the oldPhone delete block
code = code.replace(
  /if \(oldPhone && oldPhone !== newCustomer\.phone\) \{\s*await fbDeleteCustomer\(oldPhone\);\s*\}/,
  ''
);

// Fix deleteCustomer to use id instead of phone
code = code.replace(
  /await fbDeleteCustomer\(custToDelete\.phone\);/,
  'await fbDeleteCustomer(custToDelete.id);'
);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Fixed fbDeleteCustomer argument");
