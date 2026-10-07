const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const rowRegex = /csv \+= \`"\$\{item\.date\}"[^`]*\`\;/g;
const match = code.match(rowRegex);
if (match) {
    const repRow = `csv += \`"\${item.date}","\${item.time}","\${cName.replace(/"/g, '""')}","\${cPhone}","\${svcs.replace(/"/g, '""')}","\${(item.note || "").replace(/"/g, '""')}","\${(dbTherapists.find(t => t.id === item.therapistId || t.name === item.therapistId)?.name || item.therapistId || "").replace(/"/g, '""')}","\${pkgText.replace(/"/g, '""')}","\${(item.price || "0").toString().replace(/"/g, '""')}","\${st}"\\n\`;`;
    code = code.replace(rowRegex, repRow);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Patched correctly!");
} else {
    console.log("Not found.");
}
