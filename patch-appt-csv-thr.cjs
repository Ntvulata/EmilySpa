const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /"\$\{([^\}]*?item\.therapistId[^\}]*?)\.replace[^}]*\}"/;
const replaceStr = `"\${(dbTherapists.find(t => t.id === item.therapistId || t.name === item.therapistId)?.name || item.therapistId || "").replace(/"/g, '""')}"`;

if (code.match(regex)) {
    code = code.replace(regex, replaceStr);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Patched therapist name in appointments CSV");
} else {
    console.log("Could not find regex match.");
}
