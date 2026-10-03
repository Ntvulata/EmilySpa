const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// 1. Update signature
code = code.replace(
  /const processPackageDeduction = \(apptId: string, customerId: string, packageId: string, type: 'sessions' \| 'balance', dedSessions: number, dedBalance: number\) => \{/,
  "const processPackageDeduction = (apptId: string, apptDate: string, customerId: string, packageId: string, type: 'sessions' | 'balance', dedSessions: number, dedBalance: number) => {"
);

// 2. Update date inside
code = code.replace(
  /const record: any = \{\s*id: nextId,\s*date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\],/m,
  `const record: any = {
      id: nextId,
      date: apptDate,`
);

// 3. Update call in changeStatus (map)
code = code.replace(
  /processPackageDeduction\(updatedAppt\.id, updatedAppt\.customerId, pkg\.packageId, pkg\.type,/g,
  "processPackageDeduction(updatedAppt.id, updatedAppt.date, updatedAppt.customerId, pkg.packageId, pkg.type,"
);

// 4. Update call in changeStatus (single fallback)
code = code.replace(
  /processPackageDeduction\(\s*updatedAppt\.id, updatedAppt\.customerId, updatedAppt\.packageUsed, t,/gm,
  "processPackageDeduction(\n            updatedAppt.id, updatedAppt.date, updatedAppt.customerId, updatedAppt.packageUsed, t,"
);

// 5. Update call in submit (edit case and new case - same text)
code = code.replace(
  /processPackageDeduction\(\s*savedAppt\.id, savedAppt\.customerId, pkg\.packageId, pkg\.type,/gm,
  "processPackageDeduction(\n              savedAppt.id, savedAppt.date, savedAppt.customerId, pkg.packageId, pkg.type,"
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated processPackageDeduction date logic");
