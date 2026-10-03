const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target = 'packageUsed: item.packageUsed || "",';
const targetIdx = code.indexOf(target);

if (targetIdx !== -1) {
  const replacement = `packageUsed: item.packageUsed || "",
      packagesDeducted: item.packagesDeducted ? item.packagesDeducted.map(p => ({...p, deducted: String(p.deducted)})) : (item.packageUsed ? [{ packageId: item.packageUsed, type: (item.balanceDeducted ? "balance" : "sessions") as "sessions"|"balance", deducted: item.balanceDeducted ? String(item.balanceDeducted) : String(item.sessionsDeducted || 1) }] : []),`;
  code = code.substring(0, targetIdx) + replacement + code.substring(targetIdx + target.length);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Patched startEdit successfully");
} else {
  console.log("Target not found");
}
