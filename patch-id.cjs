const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target = `const nextId = "HT-" + Date.now();`;
const replacement = `const nextId = "HT-" + Date.now() + "-" + Math.floor(Math.random() * 10000);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Patched processPackageDeduction ID generation");
} else {
    console.log("Target not found!");
}
