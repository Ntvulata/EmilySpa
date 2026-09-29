const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(
  'function ServicesPage() {\n  const [notice, setNotice] = useState("");',
  'function ServicesPage() {\n  const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n  const currentUser = JSON.parse(userStr || "{}");\n  const isAdmin = currentUser?.role === "admin";\n  const [notice, setNotice] = useState("");'
);

// If the previous regex didn't match perfectly, let's just find the exact string:
if (!code.includes('const isAdmin =')) {
  code = code.replace(
    'function ServicesPage() {',
    'function ServicesPage() {\n  const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n  const currentUser = JSON.parse(userStr || "{}");\n  const isAdmin = currentUser?.role === "admin";'
  );
}

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Fixed ServicesPage isAdmin");
