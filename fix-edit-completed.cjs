const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetStr = `          const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
          if (isNewlyCompleted && form.packagesDeducted.length > 0) {
            newHistoryRecords = form.packagesDeducted.map(pkg => {
              const dedVal = Number(String(pkg.deducted).replace(/\\D/g, "")) || 0;
              return processPackageDeduction(
                savedAppt.id, savedAppt.date, savedAppt.customerId, pkg.packageId, pkg.type, 
                pkg.type === "sessions" ? dedVal : 0, 
                pkg.type === "balance" ? dedVal : 0
              );
            });
          }`;

const replacement = `          const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
          const isEditingCompleted = oldAppt.status === "xong" && form.status === "xong";

          if (isEditingCompleted) {
            // Delete old records first
            const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
            toDelete.forEach(r => {
              deletedHistoryIds.push(r.id);
              const idx = packageHistory.findIndex(h => h.id === r.id);
              if (idx !== -1) packageHistory.splice(idx, 1);
            });
          }

          if ((isNewlyCompleted || isEditingCompleted) && form.packagesDeducted.length > 0) {
            newHistoryRecords = form.packagesDeducted.map(pkg => {
              const dedVal = Number(String(pkg.deducted).replace(/\\D/g, "")) || 0;
              return processPackageDeduction(
                savedAppt.id, savedAppt.date, savedAppt.customerId, pkg.packageId, pkg.type, 
                pkg.type === "sessions" ? dedVal : 0, 
                pkg.type === "balance" ? dedVal : 0
              );
            });
          }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed edit completed logic!");
