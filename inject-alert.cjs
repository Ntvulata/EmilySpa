const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// I will replace `return setError(...)` with `return alert(...)` inside `submit`.
// But `submit` is a function, we only want to replace inside `submit`.
// Actually, `setError` is also used for "Lỗi lưu Cloud". Let's just find and replace `return setError(` with `alert(` then `return`.

// Example: `return setError("ABC")` -> `alert("ABC"); return;`
code = code.replace(/return setError\((.*?)\);/g, `do { alert($1); return setError($1); } while(0);`);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected alert for validations");
