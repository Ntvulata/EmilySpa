const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /setOpen\(false\);\n    \};\n\n    return \(/;
code = code.replace(regex, `setOpen(false);\n    } catch (err: any) { alert("Lỗi kĩ thuật: " + err.message); console.error(err); }\n    };\n\n    return (`);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed try-catch");
