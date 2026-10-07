const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

code = code.replace(
  'finalCustomName = "Thẻ " + val + " buổi - " + (svc ? svc.name : form.serviceId);',
  'finalCustomName = svc ? svc.name : form.serviceId;'
);

code = code.replace(
  'finalCustomName = "Thẻ " + val + " buổi - " + (svc ? svc.name : form.serviceId);',
  'finalCustomName = svc ? svc.name : form.serviceId;'
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Patched custom package name prefix.");
