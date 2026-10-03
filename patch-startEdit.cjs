const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /packageUsed: item\.packageUsed \|\| "",\n\s*price: item\.price/g,
  `packageUsed: item.packageUsed || "",
      packagesDeducted: item.packagesDeducted ? item.packagesDeducted.map(p => ({...p, deducted: String(p.deducted)})) : (item.packageUsed ? [{ packageId: item.packageUsed, type: (item.balanceDeducted ? "balance" : "sessions") as "sessions"|"balance", deducted: item.balanceDeducted ? String(item.balanceDeducted) : String(item.sessionsDeducted || 1) }] : []),
      price: item.price`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched startEdit");
