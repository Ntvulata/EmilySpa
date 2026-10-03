const fs = require('fs');
let code = fs.readFileSync('src/lib/spa-data.ts', 'utf8');

code = code.replace(
  /appointmentId\?: string;\n\s*\};/,
  `appointmentId?: string;
  customName?: string; // Tn gp cho thẻ d?ch v? t? do
};`
);

fs.writeFileSync('src/lib/spa-data.ts', code, 'utf8');
console.log("Updated spa-data.ts");
