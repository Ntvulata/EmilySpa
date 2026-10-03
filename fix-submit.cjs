const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

code = code.replace(
  /if \(\!form\.packageId\) return setError\("[^"]+"\);/m,
  `if (sellMode === "master" && !form.packageId) return setError("Vui lòng chọn gói/thẻ.");\n      if (sellMode === "custom" && !form.serviceId) return setError("Vui lòng chọn dịch vụ.");`
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed submit logic");
