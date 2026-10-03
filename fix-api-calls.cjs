const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  /await fbSaveAppointmentAndHistory\(savedAppt, newHistoryRecord, deletedHistoryId\);/g,
  'await fbSaveAppointmentAndHistory(savedAppt, newHistoryRecords.length > 0 ? newHistoryRecords : null, deletedHistoryIds.length > 0 ? deletedHistoryIds : null);'
);

code = code.replace(
  /await fbSaveAppointmentAndHistory\(updatedAppt, newRecord, null\);/g,
  'await fbSaveAppointmentAndHistory(updatedAppt, newRecords.length > 0 ? newRecords : null, null);'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated API calls in dashboard.appointments.tsx");
