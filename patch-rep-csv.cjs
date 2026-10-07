const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const regex = /csv \+= `[^`]*?`;/;
const repStr = `csv += \`"\${(cust?.name || row.customerId).replace(/"/g, '""')}","\${(cust?.phone || "").replace(/"/g, '""')}","\${pName.replace(/"/g, '""')}","\${fmt(row.opening)}","\${fmt(row.bought)}","\${fmt(row.used)}","\${fmt(closing)}"\\n\`;`;

const oldCode = code;
code = code.replace(regex, repStr);
fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched reports CSV quotes. Changed:", oldCode !== code);
