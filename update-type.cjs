const fs = require('fs');
let code = fs.readFileSync('src/lib/spa-data.ts', 'utf8');

code = code.replace(
  /export type Appointment = \{\s*id: string;/,
  `export type Appointment = {\n  id: string;\n  note?: string;`
);

fs.writeFileSync('src/lib/spa-data.ts', code, 'utf8');
console.log("Updated Appointment type");
