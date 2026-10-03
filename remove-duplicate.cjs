const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const firstIdx = code.indexOf('const submit = async (e: FormEvent) => {');
const secondIdx = code.indexOf('const submit = async (e: FormEvent) => {', firstIdx + 1);

if (secondIdx !== -1) {
  // Find where the second one ends. It probably ends right before `return (` for the JSX.
  const returnIdx = code.indexOf('return (', secondIdx);
  // Actually, I can just replace from secondIdx up to returnIdx
  // But wait, there might be other functions between secondIdx and returnIdx.
  // Let's just find `const changeStatus = ` or similar.
  // We can just find the bounds.
  // A safer way is to just delete the first one if it's identical, or delete the second one.
  const firstEnd = code.indexOf('};', code.indexOf('setAppts([...initialAppointments]);', firstIdx) + 50);
  
  console.log("Removing duplicate submit function.");
  code = code.substring(0, secondIdx) + code.substring(returnIdx);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
}
