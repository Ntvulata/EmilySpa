const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.settings.tsx', 'utf8');

code = code.replace(
  '  const currentUser = JSON.parse(userStr || "{}");\n  const isAdmin = currentUser.role === "admin";',
  '  let isAdmin = false;\n  try { isAdmin = JSON.parse(userStr || "{}")?.role === "admin"; } catch(e) {}'
);

fs.writeFileSync('src/routes/dashboard.settings.tsx', code, 'utf8');
console.log("Fixed SettingsPage try/catch");
