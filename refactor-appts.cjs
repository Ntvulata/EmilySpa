const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Note: Ensure `masterPackages` is used. Wait, `masterPackages` is not imported? Let's check imports.
code = code.replace(
  /packageUsed: string;\n\s*price: string;/g,
  `packageUsed: string;\n      packagesDeducted: { packageId: string; type: "sessions" | "balance"; deducted: string }[];\n      price: string;`
);

code = code.replace(
  /packageUsed: "",\n\s*price: /g,
  `packageUsed: "",\n      packagesDeducted: [],\n      price: `
);

code = code.replace(
  /packageUsed: item\.packageUsed \|\| "",/,
  `packageUsed: item.packageUsed || "",
      packagesDeducted: item.packagesDeducted ? item.packagesDeducted.map(p => ({...p, deducted: String(p.deducted)})) : 
        (item.packageUsed ? [{ 
          packageId: item.packageUsed, 
          type: (item.balanceDeducted ? "balance" : "sessions"), 
          deducted: item.balanceDeducted ? String(item.balanceDeducted) : String(item.sessionsDeducted || 1) 
        }] : []),`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Refactored form state");
