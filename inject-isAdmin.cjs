const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

if (!code.includes('const isAdmin =')) {
  code = code.replace(
    '  function AppointmentsPage() {',
    '  function AppointmentsPage() {\n    const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n    const currentUser = JSON.parse(userStr || "{}");\n    const isAdmin = currentUser.role === "admin";'
  );
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected isAdmin to dashboard.appointments.tsx");
