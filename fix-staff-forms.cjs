const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(/const newStaff = \{ name, phone: staffForm\.phone\.trim\(\), role: staffForm\.role, sessions: staffIdx !== null \? staff\[staffIdx\]\.sessions : 0 \};/g, `const newStaff = { id: staffForm.id || ("THR_" + Date.now()), name, phone: staffForm.phone.trim(), role: staffForm.role, sessions: staffIdx !== null ? staff[staffIdx].sessions : 0, revenue: staffIdx !== null ? staff[staffIdx].revenue : 0 };`);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Fixed newStaff");
