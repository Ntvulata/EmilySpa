const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Fix startEdit endTime
const oldStartEditRegex = /time: item\.time,\s*endTime: item\.endTime \|\| item\.time,/;
const newStartEdit = `time: item.time,
        endTime: item.endTime || calculateEndTime(item.time, item.serviceIds || (item as any).services || [], serviceOptions),`;
code = code.replace(oldStartEditRegex, newStartEdit);

// Fix String cast in replace
code = code.replace(
  /const p = form\.price \? Number\(form\.price\.replace\(\/\\D\/g, ""\)\) : 0;/,
  `const p = form.price ? Number(String(form.price).replace(/\\D/g, "")) : 0;`
);
code = code.replace(
  /const s = form\.sessionsDeducted \? Number\(form\.sessionsDeducted\.replace\(\/\\D\/g, ""\)\) : 0;/,
  `const s = form.sessionsDeducted ? Number(String(form.sessionsDeducted).replace(/\\D/g, "")) : 0;`
);
code = code.replace(
  /const b = form\.balanceDeducted \? Number\(form\.balanceDeducted\.replace\(\/\\D\/g, ""\)\) : 0;/,
  `const b = form.balanceDeducted ? Number(String(form.balanceDeducted).replace(/\\D/g, "")) : 0;`
);

// We should also allow endTime to be equal to time IF total duration is 0, but that shouldn't happen usually.
// Wait, if form.endTime <= form.time is checked, what if they actually have a 0 minute service?
// Usually services have > 0 minutes. If they don't, we can just let it pass if it's equal.
code = code.replace(
  /if \(!form\.endTime \|\| form\.endTime <= form\.time\) return setError\("Giờ kết thúc phải sau giờ bắt đầu\."\);/,
  `if (!form.endTime || form.endTime < form.time) return setError("Giờ kết thúc không được nhỏ hơn giờ bắt đầu.");`
);


fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed startEdit and validation");
