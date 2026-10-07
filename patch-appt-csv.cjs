const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetStr = `csv += \`"\\"\${item.date}\\"","\\"\${item.time}\\"","\\"\${cName}\\"","\\"\${cPhone}\\"","\\"\${svcs}\\"","\\"\${item.note || ""}\\"","\\"\${item.therapistId || ""}\\"","\\"\${pkgText}\\"","\\"\${st}\\""\\n\`;`;
const targetStrFallback = `csv += \`"\\"\${item.date}\\"","\\"\${item.time}\\"","\\"\${cName}\\"","\\"\${cPhone}\\"","\\"\${svcs}\\"","\\"\${item.note || ""}\\"","\\"\${item.therapistId || ""}\\"","\\"\${pkgText}\\"","\\"\${st}\\""\\n\`;`;

const repStr = `csv += \`"\${item.date}","\${item.time}","\${cName.replace(/"/g, '""')}","\${cPhone}","\${svcs.replace(/"/g, '""')}","\${(item.note || "").replace(/"/g, '""')}","\${(item.therapistId || "").replace(/"/g, '""')}","\${pkgText.replace(/"/g, '""')}","\${st}"\\n\`;`;

let c1 = code.replace(targetStr, repStr);
if (c1 === code) {
  console.log("Could not find line in appointments using exact match. Trying regex.");
  c1 = code.replace(/csv \+= `.*`;/, repStr);
}
fs.writeFileSync('src/routes/dashboard.appointments.tsx', c1, 'utf8');
console.log("Patched appointments CSV quotes.");
