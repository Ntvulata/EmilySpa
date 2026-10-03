const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');
const lines = code.split('\n');
for(let i = 1020; i <= 1040; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
