const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// I will find the exact line index and replace it.
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('t.role ==='));
if (idx !== -1) {
  lines[idx] = '      .filter((t: any) => !t.role || t.role === "Kỹ thuật viên")';
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', lines.join('\n'), 'utf8');
  console.log("Replaced line");
} else {
  console.log("Not found");
}
