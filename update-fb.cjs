const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /export const fbSaveAppointmentAndHistory = async \(appt: Appointment, record: PackageHistoryRecord \| null,/,
  'export const fbSaveAppointmentAndHistory = async (appt: Appointment, records: PackageHistoryRecord[] | null,'
);

code = code.replace(
  /if \(record\) \{\s*const recRef = doc\(db, "packageHistory", record\.id\);\s*batch\.set\(recRef, record\);\s*\}/,
  `if (records && records.length > 0) {
    for (const rec of records) {
      const recRef = doc(db, "packageHistory", rec.id);
      batch.set(recRef, rec);
    }
  }`
);

fs.writeFileSync('src/lib/firebase.ts', code, 'utf8');
console.log("Updated firebase.ts");
