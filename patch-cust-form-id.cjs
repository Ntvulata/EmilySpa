const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

code = code.replace(
  'setForm({ name: c.name, phone: c.phone, tier: c.tier });',
  'setForm({ id: c.id, name: c.name, phone: c.phone, tier: c.tier });'
);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Patched setForm id bug.");
