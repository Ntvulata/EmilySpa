const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /\.filter\(\(t: any\) => !t\.role \|\| t\.role === "Kỹ thuật viên"\)/g,
  '.filter((t: any) => !t.role || t.role.includes("thu") || t.role.includes("K1") || t.role === "Kỹ thuật viên")'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Made KTV filter robust against encoding history");
