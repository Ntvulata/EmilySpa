const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

if (!code.includes('const isAdmin =')) {
  code = code.replace(
    'function AppointmentsPage() {',
    'function AppointmentsPage() {\n  const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n  let isAdmin = false;\n  try { isAdmin = JSON.parse(userStr || "{}")?.role === "admin"; } catch(e) {}\n'
  );
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed AppointmentsPage isAdmin");
