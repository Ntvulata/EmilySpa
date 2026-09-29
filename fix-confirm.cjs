const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldBlock = `        if ((isRevertingCompleted || isChangingDeduction) && oldAppt?.packageUsed) {
            if (!isRevertingCompleted || window.confirm(\`B?n c mu?n HOAN L?I s? du/bu?i cho khch khng?\\nTr?ng thi d?i t? 'Hon thnh' sang '\${form.status}'\`)) {
              const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
              if (toDelete.length > 0) {
                deletedHistoryId = toDelete[0].id;
                toDelete.forEach(r => {
                  const idx = packageHistory.findIndex(h => h.id === r.id);
                  if (idx !== -1) packageHistory.splice(idx, 1);
                });
              }
            }
        }`;

// We will use regex to find and replace
const regex = /if \(\(isRevertingCompleted \|\| isChangingDeduction\) && oldAppt\?\.packageUsed\) \{[\s\S]*?if \(!isRevertingCompleted \|\| window\.confirm\([\s\S]*?\}\s*\}\s*\}/;

const newBlock = `if ((isRevertingCompleted || isChangingDeduction) && oldAppt?.packageUsed) {
          if (isRevertingCompleted) {
            if (!window.confirm(\`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\\nTrạng thái đổi từ 'Hoàn thành' sang '\${form.status}'\`)) {
              return; // Abort save if user clicks Cancel
            }
          }
          const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
          if (toDelete.length > 0) {
            deletedHistoryId = toDelete[0].id;
            toDelete.forEach(r => {
              const idx = packageHistory.findIndex(h => h.id === r.id);
              if (idx !== -1) packageHistory.splice(idx, 1);
            });
          }
        }`;

code = code.replace(regex, newBlock);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated confirm abort logic");
