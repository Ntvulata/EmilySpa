const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const target = `        dayAppts.forEach(a => {
          (a.serviceIds || (a as any).services || []).forEach(s => {
            sCounts[s] = (sCounts[s] || 0) + 1;
            totalServices++;
          });
        });`;

const replacement = `        dayAppts.forEach(a => {
          (a.serviceIds || (a as any).services || []).forEach(sid => {
            const sDef = serviceOptions.find(opt => opt.id === sid);
            const sName = sDef ? sDef.name : sid;
            sCounts[sName] = (sCounts[sName] || 0) + 1;
            totalServices++;
          });
        });`;

code = code.replace(target, replacement);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched service mix names.");
