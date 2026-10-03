const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// In submit function
code = code.replace(
  /await fbSaveAppointmentAndHistory\(savedAppt, newHistoryRecord, deletedHistoryId\);/g,
  'await fbSaveAppointmentAndHistory(savedAppt, newHistoryRecords, deletedHistoryIds);'
);

// Wait, I should also check if changeStatus calls fbSaveAppointmentAndHistory.
// Let's check changeStatus.
