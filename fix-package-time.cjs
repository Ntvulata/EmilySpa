const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldLogic = `    const active: { id: string, name: string, type: 'sessions' | 'balance', remaining: number }[] = [];
    pkgIds.forEach(id => {
      const rem = getRemainingPackageValue(form.customerId, id);
      if (rem > 0) {
        const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        }
      }
    });
    return active;
  }, [form.customerId, appts]); // thm appts vo dependency d? update l?i khi c thay d?i tr? th?`;

const newLogic = `    const active: { id: string, name: string, type: 'sessions' | 'balance', remaining: number }[] = [];
    pkgIds.forEach(id => {
      const hasSell = packageHistory.some(h => h.customerId === form.customerId && h.packageId === id && h.type === "sell");
      const validSells = packageHistory.filter(h => h.customerId === form.customerId && h.packageId === id && h.type === "sell" && h.date <= form.date);
      
      // Khách mua gói thẻ SAU ngày lịch hẹn này, nên không thể dùng để trừ cho lịch này
      if (hasSell && validSells.length === 0) return;

      const rem = getRemainingPackageValue(form.customerId, id);
      
      if (rem > 0 || form.packagesDeducted.some(pd => pd.packageId === id) || form.packageUsed === id) {
        const master = masterPackages.find(m => m.id === id);
        if (master) {
          active.push({ id, name: master.name, type: master.type, remaining: rem });
        }
      }
    });
    return active;
  }, [form.customerId, form.date, form.packagesDeducted, form.packageUsed, appts]);`;

if (code.includes('const active: { id: string, name: string, type: \'sessions\' | \'balance\', remaining: number }[] = [];')) {
  // Use regex to replace everything from "const active" to "}, [form.customerId, appts]);"
  const regex = /const active: \{ id: string, name: string, type: 'sessions' \| 'balance', remaining: number \}\[\] = \[\];[\s\S]*?\}, \[form\.customerId, appts\]\);.*/;
  code = code.replace(regex, newLogic);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Updated customerPackages logic successfully");
} else {
  console.log("Could not find customerPackages logic to replace");
}
