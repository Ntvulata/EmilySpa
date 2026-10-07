const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target = `  const getPackageType = (id?: string) => {
    if (!id) return "none";
    const p = masterPackages.find(x => x.id === id);
    return p ? p.type : "none";
  };`;

const replacement = `  const getPackageType = (id?: string) => {
    if (!id) return "none";
    const p = masterPackages.find(x => x.id === id);
    if (p) return p.type;
    if (id.startsWith("CUSTOM_")) return "sessions";
    return "none";
  };`;

let idx = code.indexOf('const getPackageType = (id?: string) => {');
if (idx !== -1) {
    let endIdx = code.indexOf('};', idx);
    code = code.substring(0, idx) + replacement + code.substring(endIdx + 2);
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched getPackageType");
