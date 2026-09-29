const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// The messed up block:
const regex = /if \(\(isRevertingCompleted \|\| isChangingDeduction\) && oldAppt\?\.packageUsed\) \{[\s\S]*?\}\s*\}\s*\}\s*if \(oldAppt\)/;

const fixedBlock = `if ((isRevertingCompleted || isChangingDeduction) && oldAppt?.packageUsed) {
          if (!isRevertingCompleted || window.confirm(\`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\\nTrạng thái đổi từ 'Hoàn thành' sang '\${form.status}'\`)) {
            const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
            if (toDelete.length > 0) {
              deletedHistoryId = toDelete.map(h => h.id) as any;
              toDelete.forEach(r => {
                const idx = packageHistory.findIndex(h => h.id === r.id);
                if (idx !== -1) packageHistory.splice(idx, 1);
              });
            }
          }
        }

        if (oldAppt)`;

if (regex.test(code)) {
  code = code.replace(regex, fixedBlock);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Fixed syntax");
} else {
  console.log("Regex not found");
}
