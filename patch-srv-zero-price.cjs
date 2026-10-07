const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(
  'if (!name || !price || !minutes) return setError("Vui lAng nh-p tAn d<ch v, th?i lng vA giA.");',
  'if (!name || price === undefined || isNaN(price) || !minutes) return setError("Vui lòng nhập tên dịch vụ, thời lượng và giá.");'
);
// In case the encoding messed up the string search, I'll use a regex
code = code.replace(
  /if \(!name \|\| !price \|\| !minutes\).*/g,
  'if (!name || price === undefined || isNaN(price) || !minutes) return setError("Vui lòng nhập tên dịch vụ, thời lượng và giá.");'
);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Patched zero-price service bug.");
