const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// Services
code = code.replace(/const emptyService = \{ name: "", duration: "60", price: "" \};/g, `const emptyService = { id: "", name: "", duration: "60", price: "" };`);
code = code.replace(/setForm\(\{ name: s\.name, duration: s\.duration\.replace\(\/\\D\/g, ""\), price: s\.price \? Number\(s\.price\)\.toLocaleString\("en-US"\) : "" \}\);/g, `setForm({ id: s.id, name: s.name, duration: s.duration.replace(/\\D/g, ""), price: s.price ? Number(s.price).toLocaleString("en-US") : "" });`);
code = code.replace(/const item = \{ name, duration: \`\$\{minutes\} phút\`, price \};/g, `const item = { id: form.id || ("SRV_" + Date.now()), name, duration: \`\${minutes} phút\`, price };`);

// Therapists
code = code.replace(/const emptyStaff = \{ name: "", phone: "", role: roles\[0\]! \};/g, `const emptyStaff = { id: "", name: "", phone: "", role: roles[0]! };`);
code = code.replace(/setStaffForm\(\{ name: s\.name, phone: s\.phone, role: s\.role \}\);/g, `setStaffForm({ id: s.id, name: s.name, phone: s.phone, role: s.role });`);
code = code.replace(/const newStaff = \{ name, phone: staffForm\.phone\.trim\(\), role: staffForm\.role, sessions: staffIdx !== null \? staff\[staffIdx\]!\.sessions : 0 \};/g, `const newStaff = { id: staffForm.id || ("THR_" + Date.now()), name, phone: staffForm.phone.trim(), role: staffForm.role, sessions: staffIdx !== null ? staff[staffIdx]!.sessions : 0, revenue: staffIdx !== null ? staff[staffIdx]!.revenue : 0 };`);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Forms fixed");
