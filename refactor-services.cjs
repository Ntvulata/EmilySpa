const fs = require('fs');

let srvCode = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// 1. Fix Service form adding
srvCode = srvCode.replace(
  /const form = \{ name: row\[0\]\.trim\(\), duration: row\[1\]\.trim\(\), price \};/g,
  `const form = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name: row[0].trim(), duration: row[1].trim(), price };`
);
srvCode = srvCode.replace(
  /setServices\(\(l\) => \[\.\.\.l, form\]\);/g,
  `setServices((l) => [...l, form as any]);`
);
srvCode = srvCode.replace(
  /await fbSaveService\(form\);/g,
  `await fbSaveService(form);` // no change
);

// Fix Therapist form
srvCode = srvCode.replace(
  /const form = \{ name: row\[0\]\.trim\(\), phone: row\[1\]\.trim\(\), role: row\[2\]\.trim\(\), sessions: 0 \};/g,
  `const form = { id: "THR_" + Date.now() + Math.random().toString(36).substr(2, 5), name: row[0].trim(), phone: row[1].trim(), role: row[2].trim(), sessions: 0, revenue: 0 };`
);
srvCode = srvCode.replace(
  /setTherapists\(\(l\) => \[\.\.\.l, form\]\);/g,
  `setTherapists((l) => [...l, form as any]);`
);
srvCode = srvCode.replace(
  /setTherapists\(\(l\) => \[\.\.\.l, \{ name: form\.name, phone: form\.phone, role: form\.role, sessions: 0 \}\]\);/g,
  `setTherapists((l) => [...l, { id: form.id || ("THR_" + Date.now()), name: form.name, phone: form.phone, role: form.role, sessions: 0, revenue: 0 } as any]);`
);

// Fix Master Package form
srvCode = srvCode.replace(
  /const form = \{ id: \`PK\$\{Date\.now\(\)\}\`, name: row\[0\]\.trim\(\), type, value, price \};/g,
  `const form = { id: \`PK\$\{Date.now()\}\`, name: row[0].trim(), type: type as "sessions"|"balance", value, price };`
);
srvCode = srvCode.replace(
  /setPackages\(\(l\) => \[\.\.\.l, form\]\);/g,
  `setPackages((l) => [...l, form as any]);`
);

// Fix normal manual form additions
srvCode = srvCode.replace(
  /setServices\(\(l\) => \[\.\.\.l, \{ name: form\.name, duration: form\.duration, price: form\.price \}\]\);/g,
  `setServices((l) => [...l, { id: form.id || ("SRV_" + Date.now()), name: form.name, duration: form.duration, price: form.price } as any]);`
);
srvCode = srvCode.replace(
  /await fbSaveService\(\{ name: form\.name, duration: form\.duration, price: form\.price \}\);/g,
  `await fbSaveService({ id: form.id || ("SRV_" + Date.now()), name: form.name, duration: form.duration, price: form.price });`
);

// Add missing states if any
srvCode = srvCode.replace(/const \[form, setForm\] = useState\(\{[\s\S]*?\}\);/, 'const [form, setForm] = useState({ id: "", name: "", duration: "60 phút", price: 0 });');

// Therapists manual form
srvCode = srvCode.replace(/const \[form, setForm\] = useState\(\{ name: "", phone: "", role: "Kỹ thuật viên" \}\);/g, 'const [form, setForm] = useState({ id: "", name: "", phone: "", role: "Kỹ thuật viên" });');

// Optional chaining fixes for form properties which might not exist in the initial object (type checking overrides)
srvCode = srvCode.replace(/if \(!form\.name\)/g, 'if (!(form as any).name)');

fs.writeFileSync('src/routes/dashboard.services.tsx', srvCode, 'utf8');
console.log("Services refactored");
