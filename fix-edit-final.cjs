const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const anchor = 'const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";';
const endAnchor = 'const idx = initialAppointments.findIndex(x => x.id === editId);';
const idx = code.indexOf(anchor);
const endIdx = code.indexOf(endAnchor, idx);

if (idx !== -1 && endIdx !== -1) {
    const replacement = `const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
          const isEditingCompleted = oldAppt.status === "xong" && form.status === "xong";

          if (isEditingCompleted) {
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
          }
          
          `;
          
    code = code.substring(0, idx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("SUCCESSFULLY PATCHED ISNEWLYCOMPLETED");
} else {
    console.log("COULD NOT FIND ANCHORS");
}

