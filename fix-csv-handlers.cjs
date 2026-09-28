const fs = require('fs');

// 1. dashboard.customers.tsx
let codeCust = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');
codeCust = codeCust.replace(
  /const newCust = \{ name, phone, tier: "Mới" \};/g,
  'const newCust = { id: "CUST_" + Date.now() + Math.random().toString(36).substr(2, 5), name, phone, visits: 0, activePackages: [], tier: "Mới" };'
);
fs.writeFileSync('src/routes/dashboard.customers.tsx', codeCust, 'utf8');

// 2. dashboard.services.tsx
let codeSrv = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// Service CSV
codeSrv = codeSrv.replace(
  /const item = \{ name, duration: \`\$\{duration\} phút\`, price \};/g,
  'const item = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name, duration: `${duration} phút`, price, commission: 0 };'
);

// Therapist CSV
// Let's check if Therapist CSV exists.
// The second match in services.tsx was packages: "const newItem = { id: \`PK${Date.now()}${i}\`, name, type, value, price };" - This already has an ID!
codeSrv = codeSrv.replace(
  /const newStaff = \{ name, phone: parts\[1\]\.trim\(\), role: parts\[2\]\.trim\(\), sessions: 0 \};/g,
  'const newStaff = { id: "THR_" + Date.now() + Math.random().toString(36).substr(2, 5), name, phone: parts[1].trim(), role: parts[2].trim(), sessions: 0, revenue: 0 };'
);

fs.writeFileSync('src/routes/dashboard.services.tsx', codeSrv, 'utf8');

console.log("Fixed CSV handlers");
