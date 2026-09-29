const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /const submit = async \(e: FormEvent\) => \{\n    try \{\n    e.preventDefault\(\);/g,
  `const submit = async (e: FormEvent) => {\n    e.preventDefault();`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Removed try");
