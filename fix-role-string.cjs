const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Use a simple replace on the line
code = code.replace(
  /\.filter\(\(t: any\) => !t\.role \|\| t\.role === "[^"]+"\)/g,
  '.filter((t: any) => !t.role || t.role === "Kỹ thuật viên")'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed role string");
