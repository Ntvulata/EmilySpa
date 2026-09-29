const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// We will inject a try-catch block inside the submit function so any JS error alerts the user!
// Find: const submit = async (e: FormEvent) => {
// Replace with: const submit = async (e: FormEvent) => { try {
// And find the end of the function: setOpen(false); };
// Replace with: setOpen(false); } catch (e) { alert("Lỗi kĩ thuật: " + e.message + "\n" + e.stack); } };

code = code.replace(
  /const submit = async \(e: FormEvent\) => \{/g,
  `const submit = async (e: FormEvent) => {\n    try {`
);

code = code.replace(
  /setOpen\(false\);\n    \};/g,
  `setOpen(false);\n    } catch (err: any) {\n      alert("Lỗi kĩ thuật: " + err.message);\n      console.error(err);\n    }\n    };`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected try-catch");
