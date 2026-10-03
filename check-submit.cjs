const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const submitCount = (code.match(/const submit = async \(e: FormEvent\) => \{/g) || []).length;
console.log("Submit functions found: " + submitCount);
